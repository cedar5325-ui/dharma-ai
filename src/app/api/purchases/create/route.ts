import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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
  if (!url || !key) throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.");
  return { url, key };
}

async function fetchMaterial(url: string, key: string, materialId: string) {
  const res = await fetch(`${url}/rest/v1/dharma_materials?select=*&id=eq.${encodeURIComponent(materialId)}&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`자료 조회 실패 ${res.status}: ${text.slice(0, 500)}`);
  }

  const rows = await res.json();
  return rows[0] || null;
}

export async function POST(request: NextRequest) {
  try {
    const { url, key } = assertEnv();
    const body = await request.json().catch(() => ({}));
    const materialId = body.materialId || body.material_id || body.id;

    if (!materialId) {
      return NextResponse.json({ ok: false, message: "materialId가 없습니다." }, { status: 400 });
    }

    const material = await fetchMaterial(url, key, materialId);

    if (!material) {
      return NextResponse.json({ ok: false, message: "자료를 찾지 못했습니다." }, { status: 404 });
    }

    const purchaseToken = crypto.randomBytes(24).toString("hex");

    const res = await fetch(`${url}/rest/v1/dharma_purchases`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        material_id: material.id,
        material_title: material.title,
        amount: material.price || 20000,
        status: "pending",
        purchase_token: purchaseToken,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`결제 요청 DB 등록 실패 ${res.status}: ${text.slice(0, 500)}`);
    }

    const purchase = (await res.json())[0];

    return NextResponse.json({
      ok: true,
      purchase,
      purchaseId: purchase.id,
      purchaseToken,
      token: purchaseToken,
      amount: purchase.amount,
      message: "결제 요청이 생성되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "결제 요청 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
