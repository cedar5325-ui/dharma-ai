"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import DharmaBusinessFooter from "@/components/DharmaBusinessFooter";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const message = searchParams.get("message") || "결제가 완료되지 않았습니다.";

  return (
    <>
      <Header />
      <main className="section white">
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#2865d8", fontWeight: 800 }}>DHARMA PAYMENT</p>
          <h1 className="pageTitle">결제가 완료되지 않았습니다</h1>
          <p>{message}</p>
          {code && <p style={{ fontSize: 13, color: "#66758a" }}>오류 코드: {code}</p>}
          <p style={{ marginTop: 22 }}>
            <a href="/materials">자료 목록으로 돌아가기</a>
          </p>
        </div>
      </main>
      <DharmaBusinessFooter />
    </>
  );
}


export default function PaymentFailPageWrapper() {
  return (
    <Suspense fallback={<main className="section white"><p>결제 결과를 확인하는 중입니다.</p></main>}>
      <PaymentFailContent />
    </Suspense>
  );
}
