"use client";

import Script from "next/script";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import DharmaBusinessFooter from "@/components/DharmaBusinessFooter";

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      payment: (options: { customerKey: string }) => {
        requestPayment: (options: Record<string, unknown>) => Promise<void> | void;
      };
    };
  }
}

type PurchaseView = {
  id: string;
  materialId: string;
  title: string;
  amount: number;
  status: string;
  orderId: string;
};

function PaymentContent() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchaseId") || "";
  const token = searchParams.get("token") || "";

  const [purchase, setPurchase] = useState<PurchaseView | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const amountLabel = useMemo(
    () => (purchase ? `${Number(purchase.amount).toLocaleString("ko-KR")}원` : "-"),
    [purchase]
  );

  useEffect(() => {
    async function loadPurchase() {
      if (!purchaseId || !token) {
        setMessage("자료 상세페이지에서 상품을 선택한 뒤 결제를 시작해주세요.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/purchases/${encodeURIComponent(purchaseId)}?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const json = await response.json();

        if (!response.ok || !json.ok) {
          throw new Error(json.message || "구매정보를 불러오지 못했습니다.");
        }

        setPurchase(json.purchase);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "구매정보 조회 오류");
      } finally {
        setLoading(false);
      }
    }

    loadPurchase();
  }, [purchaseId, token]);

  async function openTossCardPayment() {
    if (!purchase) return;

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!clientKey) {
      setMessage(
        "토스페이먼츠 TEST 클라이언트 키가 아직 설정되지 않았습니다. Vercel 환경변수 NEXT_PUBLIC_TOSS_CLIENT_KEY를 설정해주세요."
      );
      return;
    }

    if (!sdkReady || !window.TossPayments) {
      setMessage("토스페이먼츠 결제 모듈을 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
      return;
    }

    if (!purchase.orderId) {
      setMessage("주문번호가 없습니다. 자료 상세페이지에서 다시 결제를 시작해주세요.");
      return;
    }

    if (purchase.status === "paid") {
      setMessage("이미 결제가 완료된 주문입니다.");
      return;
    }

    setPaying(true);
    setMessage("");

    try {
      const tossPayments = window.TossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: "ANONYMOUS" });
      const origin = window.location.origin;

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: Number(purchase.amount),
        },
        orderId: purchase.orderId,
        orderName: purchase.title || "다르마(DHARMA) AI 교육자료",
        successUrl: `${origin}/payment/success`,
        failUrl: `${origin}/payment/fail`,
      });
    } catch (error) {
      setPaying(false);
      setMessage(
        error instanceof Error ? error.message : "토스 카드결제창 호출 중 오류가 발생했습니다."
      );
    }
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => setMessage("토스페이먼츠 결제 모듈을 불러오지 못했습니다.")}
      />

      <Header />

      <main className="section white">
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{ color: "#2865d8", fontWeight: 800, marginBottom: 8 }}>
            DHARMA SECURE PAYMENT
          </p>
          <h1 className="pageTitle">카드결제</h1>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            결제 버튼을 누르면 토스페이먼츠 카드결제창으로 연결됩니다.
          </p>

          {loading && <p>결제정보를 불러오는 중입니다.</p>}

          {!loading && purchase && (
            <section
              style={{
                marginTop: 24,
                padding: 26,
                border: "1px solid #dfe7f3",
                borderRadius: 20,
                background: "#f8fbff",
              }}
            >
              <p><strong>상품명</strong><br />{purchase.title}</p>
              <p><strong>결제 금액</strong><br />{amountLabel}</p>
              <p><strong>결제 유형</strong><br />건별 일회성 결제</p>

              <button
                type="button"
                className="primaryButton"
                onClick={openTossCardPayment}
                disabled={paying || !sdkReady}
                style={{ marginTop: 14, width: "100%" }}
              >
                {paying
                  ? "토스 결제창 여는 중..."
                  : sdkReady
                  ? `${amountLabel} 카드로 결제하기`
                  : "결제 모듈 준비 중..."}
              </button>
            </section>
          )}

          {message && (
            <p className="loginNotice" style={{ marginTop: 18 }}>
              {message}
            </p>
          )}
        </div>
      </main>

      <DharmaBusinessFooter />
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<main className="section white"><p>결제정보를 불러오는 중입니다.</p></main>}>
      <PaymentContent />
    </Suspense>
  );
}
