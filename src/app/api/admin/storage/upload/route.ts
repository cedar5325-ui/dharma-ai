import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_EXTENSIONS = ["hwp", "hwpx", "docx", "pdf", "pptx", "xlsx", "zip"];

function getSupabaseUrl() {
  return String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function getBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "dharma-original-files";
}
function isAdminRequest(request: NextRequest) {
  return request.cookies.get("dharma_admin_session")?.value === "authorized";
}
function assertEnv() {
  const url = getSupabaseUrl();
  const key = getServiceKey();

  if (!url || !key) {
    throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.");
  }

  return { url, key };
}

function getExtension(name: string) {
  const match = String(name || "").toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

function stripExtension(name: string) {
  return String(name || "자료").replace(/\.[^/.]+$/, "");
}

function normalize(text: string) {
  return String(text || "").toLowerCase().normalize("NFKC").replace(/\s+/g, "");
}

function isSononmun(name: string) {
  return normalize(name).includes("소논문");
}

function getPriceInfo(fileName: string) {
  if (isSononmun(fileName)) {
    return {
      price: 50000,
      priceLabel: "50,000원",
      description: "소논문으로 분류된 프리미엄 원문 다운로드 자료입니다.",
      downloadPolicy: "결제 완료 후 소논문 원문 파일 전체를 그대로 다운로드합니다.",
    };
  }

  return {
    price: 20000,
    priceLabel: "20,000원",
    description: "Supabase Storage에 등록된 원문 다운로드 자료입니다.",
    downloadPolicy: "결제 완료 후 원문 파일 전체를 그대로 다운로드합니다.",
  };
}

function mimeFromExtension(ext: string) {
  if (ext === "hwp") return "application/x-hwp";
  if (ext === "hwpx") return "application/x-hwpx";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "pdf") return "application/pdf";
  if (ext === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === "zip") return "application/zip";
  return "application/octet-stream";
}

function fileTypeFromExtension(ext: string) {
  if (ext === "hwp") return "HWP";
  if (ext === "hwpx") return "HWPX";
  if (ext === "docx") return "DOCX";
  if (ext === "pdf") return "PDF";
  if (ext === "pptx") return "PPTX";
  if (ext === "xlsx") return "XLSX";
  if (ext === "zip") return "ZIP";
  return "파일";
}

function inferSubject(name: string) {
  const n = normalize(name);

  if (["생명", "생명과학", "세포", "유전자", "면역", "막전위", "알츠하이머"].some((w) => n.includes(normalize(w)))) return "생명과학";
  if (["화학", "ph", "산성", "염기", "중화", "이성질체", "화학평형"].some((w) => n.includes(normalize(w)))) return "화학";
  if (["윤리", "고전과윤리", "윤리와사상", "칸트", "롤스", "공리주의", "정의"].some((w) => n.includes(normalize(w)))) return "윤리와사상";
  if (["사회", "사회문제", "통합사회", "사회문화", "경제", "정책", "지역"].some((w) => n.includes(normalize(w)))) return "사회문제탐구";
  if (["수학", "공통수학", "수열", "순열", "조합", "함수", "기하", "벡터", "모멘트"].some((w) => n.includes(normalize(w)))) return "수학";
  if (["국어", "문학", "독서", "화법", "작문"].some((w) => n.includes(normalize(w)))) return "국어";
  if (["영어", "english"].some((w) => n.includes(normalize(w)))) return "영어";
  if (["정보", "인공지능", "ai", "알고리즘", "데이터"].some((w) => n.includes(normalize(w)))) return "정보";

  return "분류 대기";
}

function inferUnit(name: string, subject: string) {
  const n = normalize(name);
  const candidates = [
    "소논문",
    "고전과윤리",
    "이성질체",
    "수열",
    "순열",
    "조합",
    "막전위",
    "활동전위",
    "알츠하이머",
    "산염기",
    "중화반응",
    "화학평형",
    "칸트",
    "롤스",
    "공리주의",
    "함수",
    "미분",
    "확률과통계",
    "벡터",
    "모멘트",
    "기하",
  ];

  const found = candidates.find((item) => n.includes(normalize(item)));
  return found || (subject === "분류 대기" ? "단원 미분류" : `${subject} 관련 단원`);
}

function inferKeywords(name: string, subject: string, unit: string) {
  const raw = stripExtension(name)
    .replace(/[★☆]/g, "")
    .split(/[_\-\s,·()]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2)
    .slice(0, 10);

  return Array.from(new Set([subject, unit, ...raw].filter(Boolean))).slice(0, 12);
}

function makeSafeStoragePath(ext: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `uploads/${date}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
}

function encodePath(path: string) {
  return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

async function uploadObject(args: {
  url: string;
  key: string;
  bucket: string;
  storagePath: string;
  body: Buffer;
  contentType: string;
}) {
  const response = await fetch(`${args.url}/storage/v1/object/${args.bucket}/${encodePath(args.storagePath)}`, {
    method: "POST",
    headers: {
      apikey: args.key,
      Authorization: `Bearer ${args.key}`,
      "Content-Type": args.contentType,
      "x-upsert": "false",
      "cache-control": "3600",
    },
    body: args.body as unknown as BodyInit,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Storage 업로드 실패 ${response.status}: ${text.slice(0, 500)}`);
  }
}
async function createSignedUploadUrl(args: {
  url: string;
  key: string;
  bucket: string;
  storagePath: string;
}) {
  const response = await fetch(
    `${args.url}/storage/v1/object/upload/sign/${args.bucket}/${encodePath(args.storagePath)}`,
    {
      method: "POST",
      headers: {
        apikey: args.key,
        Authorization: `Bearer ${args.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upsert: false,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Storage 업로드 URL 생성 실패 ${response.status}: ${text.slice(0, 500)}`
    );
  }

  const data = await response.json();

  const signedPath =
    data?.url ||
    data?.signedURL ||
    data?.signedUrl ||
    "";

  if (!signedPath) {
    throw new Error("Supabase signed upload URL을 받지 못했습니다.");
  }

  return signedPath.startsWith("http")
    ? signedPath
    : `${args.url}/storage/v1${signedPath.startsWith("/") ? "" : "/"}${signedPath}`;
}
async function insertMaterial(args: { url: string; key: string; row: any }) {
  const response = await fetch(`${args.url}/rest/v1/dharma_materials`, {
    method: "POST",
    headers: {
      apikey: args.key,
      Authorization: `Bearer ${args.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(args.row),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`자료 DB 등록 실패 ${response.status}: ${text.slice(0, 500)}`);
  }

  return (await response.json())[0];
}

export async function POST(request: NextRequest) {
  try {
    const { url, key } = assertEnv();
    const bucket = getBucket();
       if (!isAdminRequest(request)) {
      return NextResponse.json(
        {
          ok: false,
          message: "관리자 로그인 후 이용하세요.",
        },
        { status: 401 }
      );
    }
     const requestContentType =
      request.headers.get("content-type") || "";

    if (requestContentType.includes("application/json")) {
      const payload = await request.json();
        // STEP 1: Supabase 직접 업로드용 URL 생성
      if (payload?.action === "prepare") {
        const originalName = String(payload.fileName || "");
        const fileSize = Number(payload.size || 0);

        if (!originalName) {
          return NextResponse.json(
            {
              ok: false,
              message: "파일명이 없습니다.",
            },
            { status: 400 }
          );
        }

        const ext = getExtension(originalName);

        if (!SUPPORTED_EXTENSIONS.includes(ext)) {
          return NextResponse.json(
            {
              ok: false,
              message: `지원하지 않는 확장자입니다: ${ext}`,
            },
            { status: 400 }
          );
        }

        const MAX_DIRECT_UPLOAD_BYTES =
          50 * 1024 * 1024;

        if (
          !Number.isFinite(fileSize) ||
          fileSize <= 0 ||
          fileSize > MAX_DIRECT_UPLOAD_BYTES
        ) {
          return NextResponse.json(
            {
              ok: false,
              message:
                "현재 관리자 직접 업로드는 파일당 최대 50MB까지 지원합니다.",
            },
            { status: 400 }
          );
        }

        const storagePath =
          makeSafeStoragePath(ext);

        const contentType =
          String(payload.mimeType || "") ||
          mimeFromExtension(ext);

        const signedUrl =
          await createSignedUploadUrl({
            url,
            key,
            bucket,
            storagePath,
          });

        return NextResponse.json({
          ok: true,
          action: "prepare",
          signedUrl,
          bucket,
          storagePath,
          contentType,
          fileName: originalName,
          size: fileSize,
        });
      }
       // STEP 2: Supabase 업로드 완료 후 DB 등록
      if (payload?.action === "finalize") {
        const originalName =
          String(payload.fileName || "");

        const storagePath =
          String(payload.storagePath || "");

        const fileSize =
          Number(payload.size || 0);

        if (!originalName || !storagePath) {
          return NextResponse.json(
            {
              ok: false,
              message: "파일명 또는 Storage 경로가 없습니다.",
            },
            { status: 400 }
          );
        }

        if (!storagePath.startsWith("uploads/")) {
          return NextResponse.json(
            {
              ok: false,
              message: "올바르지 않은 Storage 경로입니다.",
            },
            { status: 400 }
          );
        }

        const ext =
          getExtension(originalName);

        if (!SUPPORTED_EXTENSIONS.includes(ext)) {
          return NextResponse.json(
            {
              ok: false,
              message: `지원하지 않는 확장자입니다: ${ext}`,
            },
            { status: 400 }
          );
        }

        const contentType =
          String(payload.mimeType || "") ||
          mimeFromExtension(ext);

        const subject =
          inferSubject(originalName);

        const unit =
          inferUnit(originalName, subject);

        const keywords =
          inferKeywords(
            originalName,
            subject,
            unit
          );

        const fileType =
          fileTypeFromExtension(ext);

        const priceInfo =
          getPriceInfo(originalName);

        const row =
          await insertMaterial({
            url,
            key,
            row: {
              title:
                stripExtension(originalName),

              subject,
              unit,
              keywords,

              file_type: fileType,
              file_name: originalName,
              mime_type: contentType,

              size_bytes: fileSize,

              storage_bucket: bucket,
              storage_path: storagePath,

              price: priceInfo.price,
              price_label:
                priceInfo.priceLabel,

              description:
                priceInfo.description,

              download_policy:
                priceInfo.downloadPolicy,

              is_active: true,

              updated_at:
                new Date().toISOString(),
            },
          });

        return NextResponse.json({
          ok: true,
          action: "finalize",

          uploaded: [
            {
              fileName: originalName,
              storagePath,
              fileType,
              size: fileSize,
              price: priceInfo.price,
              priceLabel:
                priceInfo.priceLabel,
              sononmun:
                isSononmun(originalName),
            },
          ],

          saved: [row],
        });
      }
       return NextResponse.json(
        {
          ok: false,
          message: "알 수 없는 업로드 작업입니다.",
        },
        { status: 400 }
      );
    }
    const formData = await request.formData();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);

    if (!files.length) {
      return NextResponse.json({ ok: false, message: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    const uploaded: any[] = [];
    const failed: any[] = [];
    const saved: any[] = [];

    for (const file of files) {
      try {
        const originalName = file.name || "download";
        const ext = getExtension(originalName);

        if (!SUPPORTED_EXTENSIONS.includes(ext)) {
          failed.push({ fileName: originalName, message: `지원하지 않는 확장자입니다: ${ext}` });
          continue;
        }

        const storagePath = makeSafeStoragePath(ext);
        const contentType = file.type || mimeFromExtension(ext);
        const subject = inferSubject(originalName);
        const unit = inferUnit(originalName, subject);
        const keywords = inferKeywords(originalName, subject, unit);
        const fileType = fileTypeFromExtension(ext);
        const priceInfo = getPriceInfo(originalName);

        await uploadObject({
          url,
          key,
          bucket,
          storagePath,
          contentType,
          body: Buffer.from(await file.arrayBuffer()),
        });

        const row = await insertMaterial({
          url,
          key,
          row: {
            title: stripExtension(originalName),
            subject,
            unit,
            keywords,
            file_type: fileType,
            file_name: originalName,
            mime_type: contentType,
            size_bytes: file.size,
            storage_bucket: bucket,
            storage_path: storagePath,
            price: priceInfo.price,
            price_label: priceInfo.priceLabel,
            description: priceInfo.description,
            download_policy: priceInfo.downloadPolicy,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
        });

        uploaded.push({
          fileName: originalName,
          storagePath,
          fileType,
          size: file.size,
          price: priceInfo.price,
          priceLabel: priceInfo.priceLabel,
          sononmun: isSononmun(originalName),
        });

        saved.push(row);
      } catch (error) {
        failed.push({
          fileName: file.name,
          message: error instanceof Error ? error.message : "업로드 실패",
        });
      }
    }

    return NextResponse.json({
      ok: failed.length === 0,
      bucket,
      uploadedCount: uploaded.length,
      savedCount: saved.length,
      failedCount: failed.length,
      uploaded,
      saved,
      failed,
      message:
        failed.length === 0
          ? "자료 등록이 완료되었습니다. 파일명에 소논문이 포함된 자료는 50,000원으로 등록됩니다."
          : "일부 파일 업로드에 실패했습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "관리자 업로드 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

