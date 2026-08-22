import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function env() {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase 서버 환경변수가 없습니다.");
  return { url, key };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { url, key } = env();
    const params = await context.params;
    const id = params.id;
    const token = request.nextUrl.searchParams.get("token") || "";

    if (!id || !token) {
      return NextResponse.json(
        { ok: false, message: "구매 식별정보가 없습니다." },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${url}/rest/v1/dharma_purchases?select=id,material_id,material_title,amount,status,purchase_token,toss_order_id&id=eq.${encodeURIComponent(id)}&purchase_token=eq.${encodeURIComponent(token)}&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`구매정보 조회 실패 ${res.status}: ${text.slice(0, 300)}`);
    }

    const purchase = (await res.json())[0];
    if (!purchase) {
      return NextResponse.json(
        { ok: false, message: "구매정보를 찾지 못했습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      purchase: {
        id: purchase.id,
        materialId: purchase.material_id,
        title: purchase.material_title,
        amount: Number(purchase.amount),
        status: purchase.status,
        orderId: purchase.toss_order_id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "구매정보 조회 오류",
      },
      { status: 500 }
    );
  }
}
