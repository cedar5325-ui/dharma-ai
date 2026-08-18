import { enforcePgApprovalBeforeDownload } from "@/lib/pg-download-policy";
import { NextRequest, NextResponse } from "next/server";


async function hasDharmaAdminDownloadAccess(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  if (!cookieHeader) return false;

  try {
    const adminCheck = await fetch(new URL("/admin", request.url), {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      redirect: "manual",
      cache: "no-store",
    });

    // Existing /admin authentication remains the source of truth.
    // Authenticated admin => normal 2xx page.
    // Unauthenticated visitor => redirect to /admin-login.
    return adminCheck.status >= 200 && adminCheck.status < 300;
  } catch {
    // Fail closed: if admin verification cannot be confirmed,
    // continue through the normal PG/payment policy.
    return false;
  }
}

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
    throw new Error("SUPABASE_URL ?먮뒗 SUPABASE_SERVICE_ROLE_KEY媛 .env.local???놁뒿?덈떎.");
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
    throw new Error(`?먮즺 議고쉶 ?ㅽ뙣 ${response.status}: ${text.slice(0, 500)}`);
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
    throw new Error(`寃곗젣 沅뚰븳 議고쉶 ?ㅽ뙣 ${response.status}: ${text.slice(0, 500)}`);
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
    throw new Error(`?ㅼ슫濡쒕뱶 URL ?앹꽦 ?ㅽ뙣 ${response.status}: ${text.slice(0, 500)}`);
  }

  const json = await response.json();
  const signed = json.signedURL || json.signedUrl || json.signed_url || json.url;

  if (!signed) {
    throw new Error("Supabase Storage signed URL???앹꽦?섏? ?딆븯?듬땲??");
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
  // DHARMA_ADMIN_COOKIE_DOWNLOAD_BYPASS_V5

  const dharmaAdminDownloadAllowed =

    request.cookies.get("dharma_admin_session")?.value === "authorized";


  if (!dharmaAdminDownloadAllowed) {

    // DHARMA_PG_PAYMENT_DOWNLOAD_POLICY

    const dharmaPgPolicyBlock = enforcePgApprovalBeforeDownload(request);

    if (dharmaPgPolicyBlock) return dharmaPgPolicyBlock;

  }



  try {
    const params = await context.params;
    const materialId = params.id;
    const token = request.nextUrl.searchParams.get("token") || "";

    // DHARMA_ADMIN_FULL_DOWNLOAD_BYPASS_V6


    if (!dharmaAdminDownloadAllowed && !token) {
      return NextResponse.json(
        {
          ok: false,
          message: "?ㅼ슫濡쒕뱶 ?좏겙???놁뒿?덈떎. 寃곗젣 ?꾨즺 ???ㅼ떆 ?ㅼ슫濡쒕뱶??二쇱꽭??",
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
          message: "?먮즺瑜?李얠? 紐삵뻽?듬땲?? ?먮즺 紐⑸줉?먯꽌 ?ㅼ떆 ?좏깮??二쇱꽭??",
        },
        { status: 404 }
      );
    }

    let purchase: any = null;



    if (!dharmaAdminDownloadAllowed) {


      purchase = await fetchPaidPurchase(url, key, material.id, token);



      if (!purchase) {
      return NextResponse.json(
        {
          ok: false,
          message: "寃곗젣 ?꾨즺 ???ㅼ슫濡쒕뱶?????덉뒿?덈떎.",
        },
        { status: 403 }
      );


      }


    }
    const bucket = material.storage_bucket || process.env.SUPABASE_STORAGE_BUCKET || "dharma-original-files";
    const storagePath = material.storage_path;
    const fileName = material.file_name || material.title || "download";

    if (!storagePath) {
      return NextResponse.json(
        {
          ok: false,
          message: "?먮즺??storage_path媛 ?놁뒿?덈떎. 愿由ъ옄 ?낅줈?쒕? ?ㅼ떆 ?뺤씤??二쇱꽭??",
        },
        { status: 500 }
      );
    }

    const signedUrl = await createSignedUrl(url, key, bucket, storagePath, fileName);

    if (purchase) {


      await markDownloaded(url, key, purchase);


    }

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "?ㅼ슫濡쒕뱶 泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.",
      },
      { status: 500 }
    );
  }
}

