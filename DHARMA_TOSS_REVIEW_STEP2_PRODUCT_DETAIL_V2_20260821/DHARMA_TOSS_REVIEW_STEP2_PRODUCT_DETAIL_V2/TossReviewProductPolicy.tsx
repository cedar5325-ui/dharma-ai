"use client";

import Link from "next/link";

export default function TossReviewProductPolicy() {
  const items = [
    ["결제 방식", "건별 일회성 결제 (월 구독·자동결제 없음)"],
    ["상품 금액", "일반 탐구보고서 20,000원 / 소논문 50,000원"],
    ["제공 시점", "결제 완료 및 구매내역 확인 후 즉시 제공"],
    ["제공 형태", "구매한 디지털 교육자료 원문 파일 다운로드"],
    ["이용·다운로드 기간", "결제일로부터 30일"],
    ["최대 서비스 제공기간", "결제일로부터 30일"],
  ];

  return (
    <section
      aria-label="상품 이용 및 제공 안내"
      style={{
        marginTop: 28,
        padding: "22px 24px",
        border: "1px solid #dbe7ff",
        borderRadius: 20,
        background: "#f8fbff",
        color: "#0b1b3a",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", color: "#1769e8", marginBottom: 10 }}>
        PURCHASE & SERVICE INFORMATION
      </div>

      <h2 style={{ margin: "0 0 16px", fontSize: 24, lineHeight: 1.35 }}>
        결제 및 서비스 제공 안내
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
        {items.map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              background: "#ffffff",
              border: "1px solid #e8eef8",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: "#5b6b83", marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.55 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <p style={{ margin: "16px 0 0", fontSize: 13, lineHeight: 1.7, color: "#526176" }}>
        결제 및 구매내역이 정상적으로 확인된 경우에만 구매 자료를 이용할 수 있습니다.
        환불 가능 여부와 기준은 아래 환불정책을 확인해 주세요.
      </p>

      <div style={{ marginTop: 12 }}>
        <Link
          href="/refund"
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#1769e8",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          환불정책 확인하기
        </Link>
      </div>
    </section>
  );
}
