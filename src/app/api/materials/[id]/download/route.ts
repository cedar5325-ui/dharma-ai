import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseUrl() {
  return String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function assertEnv() {
  const url = getSupabaseUrl();
  const key = getServiceKey();

  if (!url || !key) {
    throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.");
  }

  return { url, key };
}

function encodeStoragePath(path: string) {
  return String(path || "")
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

async function fetchMaterial(url: string, key: string, materialId: string) {
  const response = await fetch(
    `${url}/rest/v1/dharma_materials?select=*&id=eq.${encodeURIComponent(materialId)}&limit=1`,
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
    throw new Error(`자료 조회 실패 ${response.status}: ${text.slice(0, 500)}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

async function fetchPaidPurchase(url: string, key: string, materialId: string, token: string) {
  const response = await fetch(
    `${url}/rest/v1/dharma_purchases?select=*&material_id=eq.${encodeURIComponent(
      materialId
    )}&purchase_token=eq.${encodeURIComponent(token)}&status=eq.paid&limit=1`,
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
    throw new Error(`결제 권한 조회 실패 ${response.status}: ${text.slice(0, 500)}`);
  }

  const rows = await response.json();
  return rows[0] || null;
}

async function createSignedUrl(
  url: string,
  key: string,
  bucket: string,
  storagePath: string,
  fileName: string
) {
  const encodedPath = encodeStoragePath(storagePath);

  const response = await fetch(`${url}/storage/v1/object/sign/${bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expiresIn: 600,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`다운로드 URL 생성 실패 ${response.status}: ${text.slice(0, 500)}`);
  }

  const json = await response.json();
  const signed = json.signedURL || json.signedUrl || json.signed_url || json.url;

  if (!signed) {
    throw new Error("Supabase Storage signed URL이 생성되지 않았습니다.");
  }

  const signedUrl = signed.startsWith("http")
    ? signed
    : `${url}/storage/v1${signed.startsWith("/") ? signed : `/${signed}`}`;

  const separator = signedUrl.includes("?") ? "&" : "?";
  return `${signedUrl}${separator}download=${encodeURIComponent(fileName || "download")}`;
}

async function markDownloaded(url: string, key: string, purchase: any) {
  await fetch(`${url}/rest/v1/dharma_purchases?id=eq.${encodeURIComponent(purchase.id)}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      downloaded_at: new Date().toISOString(),
      download_count: Number(purchase.download_count || 0) + 1,
      updated_at: new Date().toISOString(),
    }),
    cache: "no-store",
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const materialId = params.id;
    const token = request.nextUrl.searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          message: "다운로드 토큰이 없습니다. 결제 완료 후 다시 다운로드해 주세요.",
        },
        { status: 403 }
      );
    }

    const { url, key } = assertEnv();

    const material = await fetchMaterial(url, key, materialId);

    if (!material) {
      return NextResponse.json(
        {
          ok: false,
          message: "자료를 찾지 못했습니다. 자료 목록에서 다시 선택해 주세요.",
        },
        { status: 404 }
      );
    }

    const purchase = await fetchPaidPurchase(url, key, material.id, token);

    if (!purchase) {
      return NextResponse.json(
        {
          ok: false,
          message: "결제 완료 후 다운로드할 수 있습니다.",
        },
        { status: 403 }
      );
    }

    const bucket = material.storage_bucket || process.env.SUPABASE_STORAGE_BUCKET || "dharma-original-files";
    const storagePath = material.storage_path;
    const fileName = material.file_name || material.title || "download";

    if (!storagePath) {
      return NextResponse.json(
        {
          ok: false,
          message: "자료의 storage_path가 없습니다. 관리자 업로드를 다시 확인해 주세요.",
        },
        { status: 500 }
      );
    }

    const signedUrl = await createSignedUrl(url, key, bucket, storagePath, fileName);

    await markDownloaded(url, key, purchase);

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "다운로드 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
