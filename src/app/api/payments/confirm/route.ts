import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseEnv() {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase 서버 환경변수가 없습니다.");
  return { url, key };
}

async function fetchPurchaseByOrderId(url: string, key: string, orderId: string) {
  const res = await fetch(
    `${url}/rest/v1/dharma_purchases?select=*&toss_order_id=eq.${encodeURIComponent(orderId)}&limit=1`,
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
    throw new Error(`주문 조회 실패 ${res.status}: ${text.slice(0, 300)}`);
  }

  return (await res.json())[0] || null;
}

async function markPaid(
  url: string,
  key: string,
  purchase: any,
  payment: any
) {
  const res = await fetch(
    `${url}/rest/v1/dharma_purchases?id=eq.${encodeURIComponent(purchase.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: "paid",
        toss_payment_key: payment.paymentKey,
        toss_status: payment.status || "DONE",
        toss_method: payment.method || null,
        paid_at: payment.approvedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`구매 완료 저장 실패 ${res.status}: ${text.slice(0, 300)}`);
  }

  return (await res.json())[0] || null;
}

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { ok: false, message: "TOSS_SECRET_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const paymentKey = String(body.paymentKey || "");
    const orderId = String(body.orderId || "");
    const receivedAmount = Number(body.amount);

    if (!paymentKey || !orderId || !Number.isFinite(receivedAmount)) {
      return NextResponse.json(
        { ok: false, message: "결제 승인 파라미터가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const { url, key } = getSupabaseEnv();
    const purchase = await fetchPurchaseByOrderId(url, key, orderId);

    if (!purchase) {
      return NextResponse.json(
        { ok: false, message: "서버에 저장된 주문을 찾지 못했습니다." },
        { status: 404 }
      );
    }

    const storedAmount = Number(purchase.amount);
    if (storedAmount !== receivedAmount) {
      return NextResponse.json(
        { ok: false, message: "결제 금액 검증에 실패했습니다." },
        { status: 400 }
      );
    }

    // Safe refresh/retry after an already-completed confirmation.
    if (purchase.status === "paid") {
      if (
        purchase.toss_payment_key &&
        purchase.toss_payment_key !== paymentKey
      ) {
        return NextResponse.json(
          { ok: false, message: "이미 다른 결제키로 완료된 주문입니다." },
          { status: 409 }
        );
      }

      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        purchaseId: purchase.id,
        materialId: purchase.material_id,
        purchaseToken: purchase.purchase_token,
        amount: storedAmount,
        orderId,
      });
    }

    if (purchase.status !== "pending") {
      return NextResponse.json(
        { ok: false, message: "결제 가능한 주문 상태가 아닙니다." },
        { status: 409 }
      );
    }

    const tossResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `dharma-confirm-${purchase.id}`,
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          // Confirm with the server-stored authoritative amount.
          amount: storedAmount,
        }),
      }
    );

    const payment = await tossResponse.json().catch(() => ({}));

    if (!tossResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: payment.message || "토스페이먼츠 결제 승인에 실패했습니다.",
          code: payment.code,
        },
        { status: tossResponse.status }
      );
    }

    const updated = await markPaid(url, key, purchase, payment);

    return NextResponse.json({
      ok: true,
      purchaseId: purchase.id,
      materialId: purchase.material_id,
      purchaseToken: purchase.purchase_token,
      amount: storedAmount,
      orderId,
      paymentStatus: payment.status,
      method: payment.method,
      approvedAt: payment.approvedAt,
      receiptUrl: payment.receipt?.url || null,
      purchase: updated,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "결제 승인 처리 오류",
      },
      { status: 500 }
    );
  }
}
