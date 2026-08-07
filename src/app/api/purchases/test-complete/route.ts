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
  if (!url || !key) throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.");
  return { url, key };
}

export async function POST(request: NextRequest) {
  try {
    const { url, key } = assertEnv();
    const body = await request.json().catch(() => ({}));

    const purchaseId = body.purchaseId || body.purchase_id || body.id || "";
    const token = body.purchaseToken || body.purchase_token || body.token || "";

    let filter = "";

    if (purchaseId) {
      filter = `id=eq.${encodeURIComponent(purchaseId)}`;
    } else if (token) {
      filter = `purchase_token=eq.${encodeURIComponent(token)}`;
    } else {
      return NextResponse.json({ ok: false, message: "purchaseId 또는 purchaseToken이 없습니다." }, { status: 400 });
    }

    const res = await fetch(`${url}/rest/v1/dharma_purchases?${filter}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`테스트 결제 완료 처리 실패 ${res.status}: ${text.slice(0, 500)}`);
    }

    const rows = await res.json();
    const purchase = rows[0];

    if (!purchase) {
      return NextResponse.json({ ok: false, message: "결제 요청을 찾지 못했습니다." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      purchase,
      purchaseId: purchase.id,
      purchaseToken: purchase.purchase_token,
      token: purchase.purchase_token,
      message: "테스트 결제 완료 처리되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "테스트 결제 완료 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
