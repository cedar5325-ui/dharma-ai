"use client";

import DharmaBusinessFooter from "../components/DharmaBusinessFooter";

const FALLBACK_LAST_UPGRADE_AT = "2026-08-14T18:24:03+09:00";

function formatKstDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "2026.08.14", time: "18:24:03" };
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "00";

  return {
    date: `${get("year")}.${get("month")}.${get("day")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

function DigitalUpgradeClock() {
  const raw =
    process.env.NEXT_PUBLIC_DHARMA_LAST_UPGRADE_AT ||
    FALLBACK_LAST_UPGRADE_AT;
  const display = formatKstDateTime(raw);

  return (
    <aside className="upgradeClock" aria-label="다르마 시스템 마지막 업그레이드 시각">
      <div className="upgradeClockTop">
        <span className="upgradeDot" aria-hidden="true" />
        <span>LAST UPGRADE</span>
      </div>
      <time className="upgradeDigits" dateTime={raw}>
        <span className="upgradeDate">{display.date}</span>
        <span className="upgradeTime">{display.time}</span>
        <span className="upgradeZone">KST</span>
      </time>
      <small>DHARMA SYSTEM UPGRADE COMPLETE</small>
    </aside>
  );
}

export default function HomePage() {
  return (
    <main className="page">
      <header className="header">
        <strong className="brand">다르마(DHARMA) AI</strong>
        <nav className="nav">
          <a href="/">홈</a>
          <a href="/materials">자료 다운로드</a>
          <a href="/pricing">요금</a>
          <a href="/admin/storage">관리자 Storage</a>
        </nav>
      </header>

      <section className="hero">
        <div className="heroTop">
          <div className="eyebrow">DHARMA VERIFIED MATERIALS</div>
          <div className="heroStatus">
            <DigitalUpgradeClock />
            <div className="verifiedBadge">교차 검증 완료</div>
          </div>
        </div>

        <h1>
          교과·도서 연계
          <br />
          심화 탐구 자료
        </h1>

        <p className="heroText">
          다르마는 단순 자료 판매가 아니라, 교과 개념에서 출발해 심화 탐구,
          관련 도서 활동, 느낀점까지 자연스럽게 이어지는 고퀄리티 탐구 보고서 자료를 제공합니다.
        </p>

        <div className="actions">
          <a className="primary" href="/materials">자료 선택하고 다운로드</a>
          <a className="ghost" href="/pricing">요금 확인</a>
        </div>

        <div className="cards3">
          <article className="card">
            <span>01</span>
            <h2>교과 연계 탐구</h2>
            <p>수업에서 배운 개념을 출발점으로 삼아 과목별 탐구 주제가 자연스럽게 확장되도록 구성합니다.</p>
          </article>

          <article className="card">
            <span>02</span>
            <h2>도서 연계 탐구</h2>
            <p>탐구 주제와 연결되는 도서 활동을 더해 학생부에 기록 가능한 사고의 깊이를 강화합니다.</p>
          </article>

          <article className="card">
            <span>03</span>
            <h2>교육과정 기반 심화</h2>
            <p>고등학교 교육과정에 충실하면서 진로와 과목 심화 역량이 드러나도록 설계합니다.</p>
          </article>
        </div>
      </section>

      <section className="pricingBand" aria-labelledby="one-time-pricing-title">
        <div className="pricingIntro">
          <small>ONE-TIME PAYMENT ONLY</small>
          <h2 id="one-time-pricing-title">월 구독 없이, 필요한 보고서만 건별 결제</h2>
          <p>정기결제와 자동갱신 없이 선택한 자료 1건만 결제합니다.</p>
        </div>

        <div className="priceGrid">
          <article className="priceCard">
            <span>STANDARD REPORT</span>
            <h3>일반 탐구보고서</h3>
            <strong>20,000원</strong>
            <p>1건 · 일회성 결제</p>
          </article>

          <article className="priceCard premiumPriceCard">
            <span>MINI PAPER</span>
            <h3>소논문</h3>
            <strong>50,000원</strong>
            <p>1건 · 일회성 결제</p>
          </article>
        </div>

        <a className="pricingCta" href="/pricing">건별 요금 자세히 보기</a>
      </section>

      <section className="cycleSection">
        <div className="cycleHead">
          <div>
            <div className="eyebrow">REPORT FLOW</div>
            <h2>탐구의 흐름을 한눈에 보여주는 순환 구조</h2>
          </div>
          <div className="flowStamp">탐구 동기 → 심화 탐구 → 도서 활동 → 느낀점</div>
        </div>

        <div className="cycleImageWrap">
          <img
            src="/images/dharma-inquiry-cycle.png"
            alt="탐구 동기, 심화 탐구, 관련 도서 활동, 느낀점으로 이어지는 탐구의 순환 구조"
            className="cycleImage"
          />
        </div>

        <div className="slogan">
          <strong>“질문에서 시작해 이해를 넓히고, 통찰로 이어지는 탐구의 흐름”</strong>
          <span>과정에 충실한 보고서가 학생의 탐구역량을 증명합니다.</span>
        </div>
      </section>

      <section className="quality">
        <article>
          <small>QUALITY</small>
          <h2>교차검증 완료한 고퀄리티 보고서</h2>
          <p>자료 구성, 과목 연계, 탐구 활용 가능성을 기준으로 검토한 보고서 자료를 제공합니다.</p>
        </article>

        <article>
          <small>RESEARCH REVIEW</small>
          <h2>전문 연구진 검토 완료</h2>
          <p>교과 개념, 탐구 주제, 진로 연계 적합성을 중심으로 검토 절차를 거친 자료를 제공합니다.</p>
        </article>

        <article>
          <small>ORIGINAL FILE</small>
          <h2>원문 파일 다운로드</h2>
          <p>결제 완료 후 Supabase Storage에 등록된 HWP/HWPX/DOCX 원문 파일을 다운로드할 수 있습니다.</p>
        </article>
      </section>

      <section className="care">
        <div>
          <small>CUSTOMER CARE POLICY</small>
          <h2>파일 문제가 있어도 끝까지 책임집니다.</h2>
          <p>
            다운로드 파일에 오류가 있거나 열리지 않는 문제가 발생한 경우,
            고객센터로 문자 연락을 주시면 확인 후 원본 파일 제공을 도와드립니다.
          </p>
        </div>

        <div className="careBox">
          <strong>중요 안내</strong>
          <p>원본 파일 제공 요청은 자료 사용 예정일 기준 최소 3일 전까지 문자로 접수해 주세요.</p>
        </div>
      </section>

      <DharmaBusinessFooter />

      <style>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, #ffffff 0%, #f1f7ff 100%);
          color: #07152f;
          font-family: Arial, sans-serif;
        }

        .header {
          height: 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 5vw;
          border-bottom: 1px solid #d9e7ff;
          background: rgba(255,255,255,.94);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .brand {
          font-size: 22px;
          font-weight: 900;
        }

        .nav {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          font-weight: 900;
        }

        .nav a {
          color: #07152f;
          text-decoration: none;
        }

        .hero,
        .cycleSection,
        .quality,
        .care {
          max-width: 1440px;
          margin: 0 auto;
        }

        .hero {
          padding: 78px 6vw 54px;
        }

        .heroTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 4px;
          font-size: 18px;
          margin-bottom: 22px;
        }

        .heroStatus {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .upgradeClock {
          min-width: 330px;
          padding: 18px 22px;
          border-radius: 24px;
          background: linear-gradient(145deg, #031126 0%, #0b2d5e 100%);
          color: #dff5ff;
          border: 1px solid rgba(126, 210, 255, .34);
          box-shadow: inset 0 0 26px rgba(40, 174, 255, .08), 0 22px 50px rgba(7, 21, 47, .2);
        }

        .upgradeClockTop {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #86d9ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2.4px;
        }

        .upgradeDot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #62e6a7;
          box-shadow: 0 0 14px rgba(98, 230, 167, .9);
          animation: upgradePulse 1.8s ease-in-out infinite;
        }

        .upgradeDigits {
          display: grid;
          grid-template-columns: auto auto auto;
          align-items: end;
          gap: 12px;
          margin-top: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 16px rgba(85, 207, 255, .36);
        }

        .upgradeDate {
          font-size: 17px;
          letter-spacing: 1px;
          color: #a9dff6;
        }

        .upgradeTime {
          font-size: 30px;
          line-height: 1;
          letter-spacing: 2px;
          font-weight: 950;
          color: #ffffff;
        }

        .upgradeZone {
          font-size: 13px;
          font-weight: 950;
          color: #62e6a7;
          padding-bottom: 3px;
        }

        .upgradeClock small {
          display: block;
          margin-top: 10px;
          color: #6faac7;
          letter-spacing: 1.3px;
          font-size: 10px;
          font-weight: 900;
        }

        @keyframes upgradePulse {
          0%, 100% { opacity: .55; transform: scale(.9); }
          50% { opacity: 1; transform: scale(1.12); }
        }

        .verifiedBadge {
          padding: 22px 34px;
          border-radius: 999px;
          background: #e11931;
          color: white;
          font-weight: 950;
          font-size: 28px;
          box-shadow: 0 24px 54px rgba(225,25,49,.32);
          border: 2px solid rgba(255,255,255,.55);
        }

        h1 {
          font-size: clamp(52px, 7vw, 96px);
          line-height: 1.03;
          letter-spacing: -0.065em;
          margin: 12px 0 0;
          font-weight: 950;
        }

        .heroText {
          font-size: 22px;
          line-height: 1.75;
          max-width: 980px;
          margin-top: 30px;
          color: #243d63;
        }

        .actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 34px;
        }

        .primary,
        .ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 28px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 950;
          font-size: 18px;
        }

        .primary {
          background: #1165e8;
          color: white;
          box-shadow: 0 18px 42px rgba(17,101,232,.28);
        }

        .ghost {
          background: white;
          color: #07152f;
          border: 1px solid #d8e7ff;
        }

        .cards3,
        .quality {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 22px;
          padding: 0 6vw;
        }

        .cards3 {
          padding: 0;
          margin-top: 56px;
        }

        .quality {
          padding-top: 10px;
          padding-bottom: 48px;
        }

        .card,
        .quality article {
          padding: 34px;
          border-radius: 34px;
          background: white;
          border: 1px solid #d8e7ff;
          box-shadow: 0 22px 60px rgba(17,101,232,.10);
        }

        .card span {
          display: inline-flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #e7f1ff;
          color: #1165e8;
          font-weight: 950;
          margin-bottom: 18px;
        }

        .card h2,
        .quality h2 {
          font-size: 30px;
          margin: 0 0 12px;
          letter-spacing: -0.04em;
        }

        .card p,
        .quality p {
          font-size: 18px;
          line-height: 1.7;
          color: #3e5578;
          margin: 0;
        }

        .pricingBand {
          max-width: 1440px;
          margin: 6px auto 28px;
          padding: 40px 6vw;
          display: grid;
          grid-template-columns: 1.1fr 1fr auto;
          align-items: center;
          gap: 24px;
          background: rgba(255,255,255,.82);
          border-top: 1px solid #d8e7ff;
          border-bottom: 1px solid #d8e7ff;
        }

        .pricingIntro small {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 2.8px;
        }

        .pricingIntro h2 {
          margin: 10px 0 10px;
          font-size: 34px;
          letter-spacing: -0.04em;
        }

        .pricingIntro p {
          margin: 0;
          color: #3e5578;
          font-size: 17px;
          line-height: 1.6;
        }

        .priceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .priceCard {
          padding: 22px;
          border-radius: 24px;
          background: #f5f9ff;
          border: 1px solid #d4e5ff;
        }

        .priceCard span {
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2px;
          color: #1165e8;
        }

        .priceCard h3 {
          margin: 10px 0 8px;
          font-size: 21px;
          letter-spacing: -0.03em;
        }

        .priceCard strong {
          display: block;
          font-size: 31px;
          letter-spacing: -0.04em;
          color: #1165e8;
        }

        .priceCard p {
          margin: 8px 0 0;
          color: #526784;
          font-size: 14px;
          font-weight: 800;
        }

        .premiumPriceCard {
          background: #fff4f6;
          border-color: #ffd2d9;
        }

        .premiumPriceCard span,
        .premiumPriceCard strong {
          color: #d91d35;
        }

        .pricingCta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 190px;
          padding: 17px 22px;
          border-radius: 18px;
          background: #07152f;
          color: white;
          text-decoration: none;
          font-weight: 950;
        }

        .cycleSection {
          padding: 60px 6vw 76px;
        }

        .cycleHead {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          flex-wrap: wrap;
        }

        .cycleHead h2 {
          font-size: 48px;
          margin: 0 0 32px;
          letter-spacing: -0.04em;
        }

        .flowStamp {
          padding: 16px 22px;
          border-radius: 22px;
          background: #1165e8;
          color: white;
          font-weight: 950;
          margin-bottom: 32px;
          box-shadow: 0 18px 40px rgba(17,101,232,.22);
        }

        .cycleImageWrap {
          padding: 28px;
          border-radius: 38px;
          background: rgba(255,255,255,.78);
          border: 1px solid #d8e7ff;
          box-shadow: 0 30px 90px rgba(17,101,232,.14);
        }

        .cycleImage {
          width: 100%;
          display: block;
          border-radius: 28px;
        }

        .slogan {
          margin-top: 28px;
          padding: 28px 34px;
          border-radius: 30px;
          background: #07152f;
          color: white;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
          font-size: 20px;
          line-height: 1.6;
          box-shadow: 0 24px 70px rgba(7,21,47,.25);
        }

        .quality small,
        .care small {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 3px;
          display: block;
          margin-bottom: 10px;
        }

        .care {
          padding: 42px;
          border-radius: 36px;
          background: linear-gradient(135deg, #07152f 0%, #123d81 100%);
          color: white;
          box-shadow: 0 24px 80px rgba(7,21,47,.22);
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 26px;
          margin-bottom: 90px;
        }

        .care h2 {
          font-size: 42px;
          line-height: 1.15;
          margin: 0 0 18px;
          letter-spacing: -0.04em;
        }

        .care p {
          font-size: 20px;
          line-height: 1.75;
          margin: 0;
          color: #dcecff;
        }

        .careBox {
          padding: 28px;
          border-radius: 26px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.22);
        }

        .careBox strong {
          display: block;
          font-size: 24px;
          margin-bottom: 12px;
        }

        @media (max-width: 900px) {
          .cards3,
          .quality,
          .care,
          .pricingBand {
            grid-template-columns: 1fr;
          }

          .heroStatus {
            width: 100%;
            justify-content: flex-start;
          }

          .upgradeClock {
            min-width: 0;
            width: 100%;
          }

          .upgradeDigits {
            grid-template-columns: 1fr auto;
          }

          .upgradeDate {
            grid-column: 1 / -1;
          }

          .priceGrid {
            grid-template-columns: 1fr;
          }

          .cycleHead h2 {
            font-size: 36px;
          }

          .verifiedBadge {
            font-size: 22px;
            padding: 18px 26px;
          }

          .cycleImageWrap {
            padding: 12px;
          }
        }
      `}</style>
    </main>
  );
}
