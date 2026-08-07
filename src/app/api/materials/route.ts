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

    const response = await fetch(
      `${url}/rest/v1/dharma_materials?select=*&is_active=eq.true&order=title.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Supabase 자료 목록 조회 실패 ${response.status}: ${text.slice(0, 500)}`);
    }

    const rows = await response.json();
    const allMaterials = rows.map(toMaterial);

    const q = normalize(query);
    const s = normalize(subject);

    const materials = allMaterials.filter((item: any) => {
      const searchable = normalize(
        `${item.title} ${item.fileName} ${item.subject} ${item.unit} ${item.fileType} ${(item.keywords || []).join(" ")}`
      );

      const queryOk = !q || searchable.includes(q);
      const subjectOk = !s || s === "전체" || normalize(item.subject).includes(s);

      return queryOk && subjectOk;
    });

    return NextResponse.json({
      ok: true,
      source: "Supabase Storage",
      total: allMaterials.length,
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
        message: error instanceof Error ? error.message : "자료 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}
