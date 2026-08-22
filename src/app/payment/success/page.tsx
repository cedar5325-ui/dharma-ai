"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import DharmaBusinessFooter from "@/components/DharmaBusinessFooter";

type Result = {
  purchaseId?: string;
  materialId?: string;
  purchaseToken?: string;
  receiptUrl?: string | null;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey") || "";
  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amount") || "";

  const [state, setState] = useState<"confirming" | "success" | "error">("confirming");
  const [message, setMessage] = useState("결제를 최종 확인하고 있습니다.");
  const [result, setResult] = useState<Result>({});

  useEffect(() => {
    async function confirm() {
      if (!paymentKey || !orderId || !amount) {
        setState("error");
        setMessage("결제 승인 정보가 없습니다.");
        return;
      }

      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const json = await response.json();

        if (!response.ok || !json.ok) {
          throw new Error(json.message || "결제 승인에 실패했습니다.");
        }

        setResult(json);
        setState("success");
        setMessage("결제가 완료되었습니다.");
      } catch (error) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "결제 승인 처리 오류");
      }
    }

    confirm();
  }, [paymentKey, orderId, amount]);

  const downloadUrl =
    result.materialId && result.purchaseToken
      ? `/api/materials/${encodeURIComponent(result.materialId)}/download?token=${encodeURIComponent(result.purchaseToken)}`
      : "";

  return (
    <>
      <Header />
      <main className="section white">
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#2865d8", fontWeight: 800 }}>DHARMA PAYMENT</p>
          <h1 className="pageTitle">
            {state === "confirming"
              ? "결제 확인 중"
              : state === "success"
              ? "결제 완료"
              : "결제 확인 실패"}
          </h1>
          <p>{message}</p>

          {state === "success" && (
            <div style={{ marginTop: 24 }}>
              {downloadUrl && (
                <a className="primaryButton" href={downloadUrl}>
                  구매한 원문 다운로드
                </a>
              )}
              <p style={{ marginTop: 16, fontSize: 13, color: "#66758a" }}>
                이용·다운로드 기간은 결제일로부터 30일입니다.
              </p>
              {result.receiptUrl && (
                <p style={{ marginTop: 12 }}>
                  <a href={result.receiptUrl} target="_blank" rel="noreferrer">
                    결제 영수증 확인
                  </a>
                </p>
              )}
            </div>
          )}

          {state === "error" && (
            <p style={{ marginTop: 20 }}>
              <a href="/materials">자료 목록으로 돌아가기</a>
            </p>
          )}
        </div>
      </main>
      <DharmaBusinessFooter />
    </>
  );
}


export default function PaymentSuccessPageWrapper() {
  return (
    <Suspense fallback={<main className="section white"><p>결제 결과를 확인하는 중입니다.</p></main>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
