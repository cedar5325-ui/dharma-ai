"use client";

import Link from "next/link";
import { DHARMA_BUSINESS } from "../lib/dharmaBusiness";

export default function DharmaBusinessFooter() {
  return (
    <footer
      style={{
        marginTop: 56,
        borderTop: "1px solid #dfe7f3",
        background: "#f7f9fc",
        color: "#445268",
      }}
    >
      <div
        style={{
          width: "min(1180px, calc(100% - 32px))",
          margin: "0 auto",
          padding: "30px 0 34px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 16px",
            alignItems: "baseline",
            marginBottom: 16,
          }}
        >
          <strong
            style={{
              color: "#0b1b3a",
              fontSize: 16,
              letterSpacing: "-0.02em",
            }}
          >
            {DHARMA_BUSINESS.brandName}
          </strong>
          <span style={{ fontSize: 13 }}>
            법적 사업자명: {DHARMA_BUSINESS.businessName}
          </span>
        </div>

        {/* DHARMA_TOSS_REVIEW_STEP4_BUSINESS_INFO */}
        <div
          aria-label="사업자정보"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "8px 22px",
            fontSize: 13,
            lineHeight: 1.75,
          }}
        >
          <div>
            <strong>상호명</strong> {DHARMA_BUSINESS.businessName}
          </div>
          <div>
            <strong>대표자명</strong> {DHARMA_BUSINESS.representative}
          </div>
          <div>
            <strong>사업자등록번호</strong> {DHARMA_BUSINESS.businessNumber}
          </div>
          <div>
            <strong>고객센터</strong> {DHARMA_BUSINESS.phone}
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <strong>사업장 주소</strong> {DHARMA_BUSINESS.address}
          </div>
          <div>
            <strong>업태</strong> {DHARMA_BUSINESS.businessType}
          </div>
          <div>
            <strong>종목</strong> {DHARMA_BUSINESS.businessItems}
          </div>
          <div>
            <strong>이메일</strong>{" "}
            <a
              href={`mailto:${DHARMA_BUSINESS.email}`}
              style={{ color: "inherit" }}
            >
              {DHARMA_BUSINESS.email}
            </a>
          </div>
        </div>

        <nav
          aria-label="정책 링크"
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #e4eaf3",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          <Link href="/pricing" style={{ color: "#445268", textDecoration: "none" }}>
            가격안내
          </Link>
          <Link href="/refund" style={{ color: "#445268", textDecoration: "none" }}>
            환불정책
          </Link>
          <Link href="/terms" style={{ color: "#445268", textDecoration: "none" }}>
            이용약관
          </Link>
          <Link href="/privacy" style={{ color: "#445268", textDecoration: "none" }}>
            개인정보처리방침
          </Link>
        </nav>

        <div style={{ marginTop: 14, fontSize: 12, color: "#78869a" }}>
          © 2026 {DHARMA_BUSINESS.brandName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
