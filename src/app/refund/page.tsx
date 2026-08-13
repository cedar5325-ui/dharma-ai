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


export default function RefundPage() {
  return (
    <main className="page">
      <TopNav />
      <PageHeader
        eyebrow="REFUND POLICY"
        title="환불 및 파일 오류 안내"
        description="자료 다운로드 서비스의 특성상 다운로드 여부와 파일 오류 여부에 따라 환불 및 재제공 기준이 달라집니다."
      />

      <section className="section">
        <article className="card">
          <h2>환불 기준</h2>
          <table className="table">
            <thead>
              <tr>
                <th>상황</th>
                <th>처리 기준</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>결제 후 다운로드 전</td>
                <td>고객센터 확인 후 환불 가능</td>
              </tr>
              <tr>
                <td>다운로드 완료 후</td>
                <td>디지털 원문 자료 특성상 원칙적으로 환불 제한</td>
              </tr>
              <tr>
                <td>파일 오류 또는 열람 불가</td>
                <td>고객센터 문자 확인 후 원본 파일 재제공 또는 별도 안내</td>
              </tr>
              <tr>
                <td>단순 변심</td>
                <td>다운로드 전에는 확인 가능, 다운로드 후에는 환불 제한</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>파일 문제 발생 시 처리</h2>
          <p>다운로드 파일에 오류가 있거나 열리지 않는 문제가 발생한 경우, 고객센터로 문자 연락을 주시면 확인 후 원본 파일 제공을 도와드립니다.</p>
          <div className="notice danger">
            원본 파일 제공 요청은 자료 사용 예정일 기준 최소 3일 전까지 문자로 접수해 주세요.
          </div>
          <ul>
            <li>파일명과 결제 자료명을 함께 보내 주세요.</li>
            <li>오류 화면 또는 열리지 않는 상황을 간단히 설명해 주세요.</li>
            <li>자료 사용 예정일 기준 최소 3일 전까지 요청해야 원본 파일 제공이 가능합니다.</li>
          </ul>
        </article>

        <article className="card">
          <h2>다운로드 권한</h2>
          <p>자료는 월 구독 없이 1건 단위로 결제하며, 결제 완료 후 해당 자료 1건의 다운로드 권한이 부여됩니다.</p>
          <p>무단 공유, 재배포, 재판매는 허용되지 않습니다.</p>
        </article>
      </section>
      <BusinessFooter />
      {styleBlock}
    </main>
  );
}
