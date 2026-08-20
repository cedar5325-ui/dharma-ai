"use client";

import Link from "next/link";
import DharmaBusinessFooter from "../../components/DharmaBusinessFooter";

const rows = [
  {
    title: "결제 후 다운로드 전",
    desc: "구매한 원문 파일을 아직 다운로드하지 않은 경우, 고객센터를 통해 환불을 요청할 수 있습니다. 환불 가능 여부는 결제 상태와 이용 이력을 확인한 뒤 안내합니다.",
  },
  {
    title: "원문 파일 다운로드 후",
    desc: "디지털 콘텐츠의 특성상 원문 파일 다운로드가 시작되었거나 완료된 이후에는 단순 변심에 의한 환불이 제한될 수 있습니다. 다만 관련 법령상 환불이 필요한 경우에는 해당 기준을 우선 적용합니다.",
  },
  {
    title: "파일 오류·상품 설명과 현저한 차이",
    desc: "파일이 정상적으로 열리지 않거나, 제공된 자료가 상품 상세 설명과 현저하게 다른 경우에는 확인 후 재제공 또는 환불을 진행합니다.",
  },
  {
    title: "중복 결제·오결제",
    desc: "동일 상품의 중복 결제 또는 명백한 오결제가 확인되는 경우에는 결제내역 확인 후 환불을 진행합니다.",
  },
  {
    title: "서비스 제공기간",
    desc: "구매한 자료의 이용 및 다운로드 가능 기간은 결제일로부터 30일입니다. 제공기간이 지난 뒤에는 단순 미이용을 이유로 자동 환불되지 않습니다.",
  },
  {
    title: "환불 처리기간",
    desc: "환불이 승인된 경우 결제수단 및 카드사 사정에 따라 실제 환급까지 영업일 기준 수일이 소요될 수 있습니다.",
  },
];

export default function RefundPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f9ff",
        color: "#091a3a",
      }}
    >
      <section
        style={{
          width: "min(1080px, calc(100% - 32px))",
          margin: "0 auto",
          padding: "72px 0 52px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#1769e8",
            marginBottom: 14,
          }}
        >
          DHARMA CUSTOMER POLICY
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(36px, 6vw, 64px)",
            lineHeight: 1.08,
            letterSpacing: "-0.045em",
          }}
        >
          환불정책
        </h1>

        <p
          style={{
            margin: "20px 0 0",
            maxWidth: 820,
            color: "#526176",
            fontSize: 17,
            lineHeight: 1.8,
          }}
        >
          다르마(DHARMA) AI는 일반 탐구보고서 및 소논문 형태의 디지털 교육자료를
          건별 일회성 결제로 제공합니다. 아래 기준은 고객이 결제 전 환불 가능 여부를
          쉽게 확인할 수 있도록 안내하기 위한 정책입니다.
        </p>

        <div
          style={{
            marginTop: 32,
            padding: "20px 22px",
            borderRadius: 18,
            border: "1px solid #cfe0ff",
            background: "#eaf2ff",
          }}
        >
          <strong style={{ display: "block", marginBottom: 8, fontSize: 17 }}>
            상품 제공 기준
          </strong>
          <div style={{ lineHeight: 1.75, fontSize: 15 }}>
            결제 완료 및 구매내역 확인 후 즉시 제공되며, 구매 자료의 이용·다운로드
            가능 기간은 <strong>결제일로부터 30일</strong>입니다.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 28,
          }}
        >
          {rows.map((item) => (
            <article
              key={item.title}
              style={{
                padding: "22px 22px",
                borderRadius: 20,
                background: "#ffffff",
                border: "1px solid #e4ebf7",
                boxShadow: "0 10px 30px rgba(24, 67, 130, 0.06)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                }}
              >
                {item.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: "#526176",
                }}
              >
                {item.desc}
              </p>
            </article>
          ))}
        </div>

        <section
          style={{
            marginTop: 28,
            padding: "24px",
            borderRadius: 20,
            background: "#0b1b3a",
            color: "#ffffff",
          }}
        >
          <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>환불 요청 방법</h2>
          <p style={{ margin: 0, lineHeight: 1.8, color: "#d8e4f8" }}>
            환불을 요청하실 때에는 구매자 정보, 결제일시, 상품명, 결제금액 및 환불
            사유를 고객센터로 보내주세요. 결제내역과 다운로드 여부를 확인한 뒤
            처리 가능 여부를 안내합니다.
          </p>
          <div style={{ marginTop: 16, lineHeight: 1.9 }}>
            <div><strong>고객센터</strong> 010-5641-1225</div>
            <div><strong>이메일</strong> cedar5325@gmail.com</div>
          </div>
        </section>

        <div
          style={{
            marginTop: 24,
            padding: "18px 20px",
            borderRadius: 16,
            background: "#ffffff",
            border: "1px solid #e4ebf7",
            color: "#526176",
            fontSize: 13,
            lineHeight: 1.75,
          }}
        >
          본 정책보다 관계 법령에서 소비자에게 더 유리한 기준을 정하고 있는 경우에는
          해당 법령을 우선 적용합니다. 개별 결제수단 또는 카드사의 취소·환급 처리기간은
          결제수단별로 다를 수 있습니다.
        </div>

        <div style={{ marginTop: 26, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link
            href="/materials"
            style={{
              padding: "13px 18px",
              borderRadius: 12,
              background: "#1769e8",
              color: "#ffffff",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            판매 자료 확인
          </Link>
          <Link
            href="/terms"
            style={{
              padding: "13px 18px",
              borderRadius: 12,
              background: "#ffffff",
              color: "#0b1b3a",
              fontWeight: 800,
              textDecoration: "none",
              border: "1px solid #dbe3ef",
            }}
          >
            이용약관 확인
          </Link>
        </div>
      </section>

      {/* DHARMA_TOSS_REVIEW_STEP3_REFUND_POLICY */}
      <DharmaBusinessFooter />
    </main>
  );
}
