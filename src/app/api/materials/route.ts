import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseUrl() {
  return String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function normalize(text: string) {
  return String(text || "").toLowerCase().normalize("NFKC").replace(/\s+/g, "");
}

function assertEnv() {
  const url = getSupabaseUrl();
  const key = getServiceKey();

  if (!url || !key) {
    throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.");
  }

  return { url, key };
}

function toMaterial(row: any) {
  return {
    id: row.id,
    fileId: row.id,
    title: row.title || row.file_name || "제목 없는 자료",
    fileName: row.file_name || "",
    mimeType: row.mime_type || "",
    subject: row.subject || "분류 대기",
    unit: row.unit || "단원 미분류",
    keywords: row.keywords || [],
    fileType: row.file_type || "파일",
    price: row.price || 20000,
    priceLabel: row.price_label || `${Number(row.price || 20000).toLocaleString("ko-KR")}원`,
    description: row.description || "Supabase Storage에 등록된 원문 다운로드 자료입니다.",
    downloadPolicy: row.download_policy || "결제 완료 후 원문 파일 전체를 다운로드합니다.",
    storageBucket: row.storage_bucket || "dharma-original-files",
    storagePath: row.storage_path || "",
    sizeBytes: row.size_bytes || null,
    modifiedTime: row.updated_at || row.created_at || null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { url, key } = assertEnv();

    const query = request.nextUrl.searchParams.get("query") || "";
    const subject = request.nextUrl.searchParams.get("subject") || "";

    const cleanQuery = query.trim();
    const cleanSubject = subject.trim();

    const PAGE_SIZE = 1000;

    function buildParams(includeSearch = true) {
      const params = new URLSearchParams();

      params.set("select", "*");
      params.set("is_active", "eq.true");
      params.set("order", "title.asc");

      if (includeSearch && cleanQuery) {
        const safeQuery = cleanQuery
          .replace(/,/g, " ")
          .replace(/\(/g, " ")
          .replace(/\)/g, " ")
          .trim();

        params.set(
          "or",
          `(title.ilike.*${safeQuery}*,file_name.ilike.*${safeQuery}*,subject.ilike.*${safeQuery}*,unit.ilike.*${safeQuery}*)`
        );
      }

      if (
        includeSearch &&
        cleanSubject &&
        cleanSubject !== "전체"
      ) {
        params.set(
          "subject",
          `ilike.*${cleanSubject}*`
        );
      }

      return params;
    }

    async function fetchExactCount(params: URLSearchParams) {
      const response = await fetch(
        `${url}/rest/v1/dharma_materials?${params.toString()}`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Prefer: "count=exact",
            Range: "0-0",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");

        throw new Error(
          `Supabase 자료 개수 조회 실패 ${response.status}: ${text.slice(0, 500)}`
        );
      }

      const contentRange =
        response.headers.get("content-range") || "";

      const totalPart = contentRange.split("/")[1];

      if (
        totalPart &&
        totalPart !== "*" &&
        !Number.isNaN(Number(totalPart))
      ) {
        return Number(totalPart);
      }

      const rows = await response.json();

      return Array.isArray(rows) ? rows.length : 0;
    }

    async function fetchAllRows(params: URLSearchParams) {
      const allRows: any[] = [];

      let from = 0;

      while (true) {
        const to = from + PAGE_SIZE - 1;

        const response = await fetch(
          `${url}/rest/v1/dharma_materials?${params.toString()}`,
          {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
              Range: `${from}-${to}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const text = await response.text().catch(() => "");

          throw new Error(
            `Supabase 자료 목록 조회 실패 ${response.status}: ${text.slice(0, 500)}`
          );
        }

        const rows = await response.json();

        if (!Array.isArray(rows)) {
          break;
        }

        allRows.push(...rows);

        if (rows.length < PAGE_SIZE) {
          break;
        }

        from += PAGE_SIZE;
      }

      return allRows;
    }

    // 전체 활성 자료 개수
    // 검색어와 관계없이 실제 전체 자료 수를 계산합니다.
    const totalParams = buildParams(false);

    const total = await fetchExactCount(totalParams);

    // 검색 조건을 Supabase에서 먼저 적용합니다.
    // 그 결과가 1,000개를 넘어도 페이지를 넘겨 끝까지 가져옵니다.
    const searchParams = buildParams(true);

    const rows = await fetchAllRows(searchParams);

    const q = normalize(query);
    const s = normalize(subject);

    // 서버 검색 후 한 번 더 검증합니다.
    // 중복 자료는 제거하지 않습니다.
    const materials = rows
      .map(toMaterial)
      .filter((item: any) => {
        const searchable = normalize(
          `${item.title} ${item.fileName} ${item.subject} ${item.unit} ${item.fileType} ${(item.keywords || []).join(" ")}`
        );

        const queryOk =
          !q || searchable.includes(q);

        const subjectOk =
          !s ||
          s === "전체" ||
          normalize(item.subject).includes(s);

        return queryOk && subjectOk;
      });

    return NextResponse.json({
      ok: true,
      source: "Supabase Storage",
      total,
      count: materials.length,
      materials,
      message: "Supabase Storage 원문 자료 목록입니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "Supabase Storage",
        total: 0,
        count: 0,
        materials: [],
        message:
          error instanceof Error
            ? error.message
            : "자료 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}