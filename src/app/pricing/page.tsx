"use client";


function PageHeader({ title, eyebrow, description }: { title: string; eyebrow: string; description: string }) {
  return (
    <section className="hero">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function TopNav() {
  return (
    <header className="header">
      <strong>다르마(DHARMA) AI</strong>
      <nav>
        <a href="/">홈</a>
        <a href="/materials">자료 다운로드</a>
        <a href="/pricing">요금</a>
        <a href="/refund">환불</a>
        <a href="/terms">약관</a>
        <a href="/privacy">개인정보</a>
      </nav>
    </header>
  );
}

function BusinessFooter() {
  return (
    <footer className="businessFooter">
      <div>
        <strong>다르마(DHARMA) AI</strong>
        <p>사업자명: 다르마(DHARMA) AI</p>
      </div>
      <div className="footerLinks">
        <a href="/pricing">요금</a>
        <a href="/refund">환불규정</a>
        <a href="/terms">이용약관</a>
        <a href="/privacy">개인정보처리방침</a>
      </div>
    </footer>
  );
}

const styleBlock = (
  <style>{`
    * { box-sizing: border-box; }
    .page {
      min-height: 100vh;
      background: linear-gradient(180deg, #ffffff 0%, #f1f7ff 100%);
      color: #07152f;
      font-family: Arial, sans-serif;
      padding-bottom: 90px;
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
    .header strong {
      font-size: 22px;
      font-weight: 950;
    }
    nav {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      font-weight: 900;
    }
    nav a {
      color: #07152f;
      text-decoration: none;
    }
    .hero, .section {
      max-width: 1400px;
      margin: 0 auto;
      padding-left: 6vw;
      padding-right: 6vw;
    }
    .hero {
      padding-top: 72px;
      padding-bottom: 28px;
    }
    .eyebrow {
      color: #1165e8;
      letter-spacing: 4px;
      font-weight: 950;
      margin-bottom: 18px;
    }
    h1 {
      font-size: clamp(48px, 6vw, 76px);
      line-height: 1.05;
      letter-spacing: -0.055em;
      margin: 0 0 22px;
      font-weight: 950;
    }
    .hero p {
      font-size: 22px;
      line-height: 1.7;
      color: #385173;
      max-width: 980px;
    }
    .card {
      background: white;
      border: 1px solid #d8e7ff;
      border-radius: 34px;
      box-shadow: 0 22px 60px rgba(17,101,232,.08);
      padding: 34px;
      margin-top: 24px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px;
    }
    .grid3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 22px;
    }
    h2 {
      font-size: 34px;
      margin: 0 0 18px;
      letter-spacing: -0.04em;
    }
    h3 {
      font-size: 26px;
      margin: 0 0 12px;
      letter-spacing: -0.035em;
    }
    p, li {
      font-size: 19px;
      line-height: 1.8;
      color: #30496e;
    }
    ul {
      padding-left: 22px;
      margin: 12px 0 0;
    }
    .price {
      font-size: 46px;
      font-weight: 950;
      letter-spacing: -0.04em;
      color: #1165e8;
      margin: 12px 0;
    }
    .premium {
      color: #e11931;
    }
    .badge {
      display: inline-flex;
      padding: 10px 14px;
      border-radius: 999px;
      background: #eaf4ff;
      color: #1165e8;
      font-weight: 950;
      margin-bottom: 14px;
    }
    .redBadge {
      background: #e11931;
      color: white;
    }
    .notice {
      background: #eaf4ff;
      border: 1px solid #d8e7ff;
      border-radius: 24px;
      padding: 24px;
      margin-top: 22px;
      font-weight: 900;
      color: #183f72;
    }
    .danger {
      background: #fff4e5;
      border-color: #ffd59b;
      color: #7a3d00;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 22px;
      margin-top: 18px;
      font-size: 18px;
    }
    .table th, .table td {
      border-bottom: 1px solid #d8e7ff;
      padding: 18px;
      text-align: left;
      line-height: 1.6;
    }
    .table th {
      background: #eaf4ff;
      font-weight: 950;
      color: #183f72;
    }
    .table tr:last-child td {
      border-bottom: 0;
    }
    .cta {
      display: inline-flex;
      margin-top: 22px;
      padding: 18px 28px;
      border-radius: 18px;
      background: #1165e8;
      color: white;
      text-decoration: none;
      font-weight: 950;
      box-shadow: 0 18px 42px rgba(17,101,232,.24);
    }

    .businessFooter {
      max-width: 1400px;
      margin: 38px auto 0;
      padding: 30px 6vw 10px;
      border-top: 1px solid #d8e7ff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 22px;
      flex-wrap: wrap;
    }
    .businessFooter strong {
      display: block;
      font-size: 21px;
      color: #07152f;
    }
    .businessFooter p {
      margin: 6px 0 0;
      font-size: 15px;
      color: #536985;
    }
    .footerLinks {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footerLinks a {
      color: #30496e;
      text-decoration: none;
      font-weight: 900;
    }
    @media (max-width: 900px) {
      .grid, .grid3 {
        grid-template-columns: 1fr;
      }
      .header {
        height: auto;
        padding: 18px 5vw;
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `}</style>
);


export default function PricingPage() {
  return (
    <main className="page">
      <TopNav />
      <PageHeader
        eyebrow="DHARMA PRICING"
        title="건별 결제 요금 안내"
        description="월 구독·정기결제·자동갱신 없이 필요한 자료를 1건씩 선택해 결제합니다."
      />

      <section className="section">
        <div className="grid">
          <article className="card">
            <div className="badge">STANDARD</div>
            <h2>일반 탐구보고서</h2>
            <div className="price">20,000원</div>
            <p>교과 연계 탐구, 도서 연계 탐구, 교육과정 기반 심화 탐구보고서를 1건 단위로 이용합니다.</p>
            <ul>
              <li>HWP/HWPX/DOCX/PDF 원문 파일 다운로드</li>
              <li>교과 개념과 탐구 주제 연계</li>
              <li>자료 1건 단위 결제</li>
            </ul>
          </article>

          <article className="card">
            <div className="badge redBadge">PREMIUM</div>
            <h2>소논문 자료</h2>
            <div className="price premium">50,000원</div>
            <p>파일명 또는 제목에 ‘소논문’이 포함된 프리미엄 자료는 50,000원으로 분류됩니다.</p>
            <ul>
              <li>소논문 원문 파일 전체 다운로드</li>
              <li>심화 탐구 구조와 분석 흐름 중심</li>
              <li>프리미엄 원문 자료로 별도 가격 적용</li>
            </ul>
          </article>
        </div>

        <article className="card">
          <h2>가격 적용 기준</h2>
          <table className="table">
            <thead>
              <tr>
                <th>자료 구분</th>
                <th>가격</th>
                <th>적용 기준</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>일반 탐구보고서</td>
                <td>20,000원</td>
                <td>파일명 또는 제목에 ‘소논문’이 포함되지 않은 일반 탐구보고서 자료</td>
              </tr>
              <tr>
                <td>소논문 자료</td>
                <td>50,000원</td>
                <td>파일명 또는 제목에 ‘소논문’이 포함된 프리미엄 자료</td>
              </tr>
            </tbody>
          </table>
          <div className="notice">
            월 구독과 자동결제는 없습니다. 결제 완료 후 선택한 자료 1건에 대한 다운로드 권한이 부여됩니다.
          </div>
          <a className="cta" href="/materials">자료 선택하러 가기</a>
        </article>
      </section>
      <BusinessFooter />
      {styleBlock}
    </main>
  );
}
