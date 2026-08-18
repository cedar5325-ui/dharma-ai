import { DHARMA_BUSINESS } from "../lib/dharmaBusiness";

export default function DharmaBusinessFooter() {
  const businessType = DHARMA_BUSINESS.businessTypes.join(" · ");
  const businessItem = DHARMA_BUSINESS.businessItems.join(" · ");

  return (
    <footer className="legalBusinessFooter">
      <div className="legalBusinessInfo">
        <div className="legalBusinessHeading">
          <strong>{DHARMA_BUSINESS.serviceName}</strong>
          <span>운영 상호: {DHARMA_BUSINESS.tradeName}</span>
        </div>

        <div className="legalBusinessMeta" aria-label="사업자 기본 정보">
          <span>
            <b>대표자</b> {DHARMA_BUSINESS.representative}
          </span>
          <span>
            <b>사업자등록번호</b> {DHARMA_BUSINESS.registrationNumber}
          </span>
          <span className="taxBadge">{DHARMA_BUSINESS.taxType}</span>
        </div>

        <address>
          <b>사업장 주소</b> {DHARMA_BUSINESS.address}
        </address>
        <p>
          <b>업태</b> {businessType}
        </p>
        <p>
          <b>종목</b> {businessItem}
        </p>

        {DHARMA_BUSINESS.mailOrderReportNumber ? (
          <p>
            <b>통신판매업 신고번호</b> {DHARMA_BUSINESS.mailOrderReportNumber}
          </p>
        ) : null}
      </div>

      <nav className="legalFooterLinks" aria-label="사업자 및 이용 정책">
        <a href="/pricing">요금</a>
        <a href="/refund">환불규정</a>
        <a href="/terms">이용약관</a>
        <a href="/privacy">개인정보처리방침</a>
      </nav>

      <style jsx>{`
        .legalBusinessFooter {
          max-width: 1440px;
          margin: 38px auto 0;
          padding: 34px 6vw 48px;
          border-top: 1px solid #d8e7ff;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: 28px;
          color: #536985;
        }

        .legalBusinessHeading {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 13px;
        }

        .legalBusinessHeading strong {
          color: #07152f;
          font-size: 22px;
          letter-spacing: -0.03em;
        }

        .legalBusinessHeading span {
          color: #30496e;
          font-size: 15px;
          font-weight: 800;
        }

        .legalBusinessMeta {
          display: flex;
          align-items: center;
          gap: 10px 18px;
          flex-wrap: wrap;
          margin-bottom: 9px;
          font-size: 14px;
          line-height: 1.7;
        }

        .legalBusinessMeta span:not(:last-child)::after {
          content: "";
          display: inline-block;
          width: 1px;
          height: 12px;
          margin-left: 18px;
          background: #c7d7ee;
          vertical-align: -1px;
        }

        .legalBusinessInfo b {
          color: #30496e;
          margin-right: 5px;
        }

        .taxBadge {
          display: inline-flex;
          padding: 4px 9px;
          border-radius: 999px;
          background: #eaf4ff;
          color: #1165e8;
          font-size: 12px;
          font-weight: 900;
        }

        .taxBadge::after {
          display: none !important;
        }

        address,
        p {
          margin: 5px 0 0;
          font-size: 14px;
          line-height: 1.75;
          font-style: normal;
          color: #536985;
        }

        .legalFooterLinks {
          display: flex;
          justify-content: flex-end;
          gap: 10px 16px;
          flex-wrap: wrap;
          max-width: 360px;
        }

        .legalFooterLinks a {
          color: #30496e;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          white-space: nowrap;
        }

        .legalFooterLinks a:hover,
        .legalFooterLinks a:focus-visible {
          color: #1165e8;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        @media (max-width: 900px) {
          .legalBusinessFooter {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .legalFooterLinks {
            justify-content: flex-start;
            max-width: none;
          }

          .legalBusinessMeta span::after {
            display: none !important;
          }
        }
      `}</style>
    </footer>
  );
}
