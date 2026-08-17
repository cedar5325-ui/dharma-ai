"use client";

import DharmaBusinessFooter from "../../components/DharmaBusinessFooter";
import { DHARMA_BUSINESS } from "../../lib/dharmaBusiness";


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


export default function PrivacyPage() {
  return (
    <main className="page">
      <TopNav />
      <PageHeader
        eyebrow="PRIVACY POLICY"
        title="개인정보처리방침"
        description="다르마(DHARMA) AI는 자료 결제, 다운로드 권한 관리, 고객 문의 응대를 위해 필요한 범위의 정보만 처리합니다."
      />

      <section className="section">
        <article className="card">
          <h2>개인정보 처리 주체</h2>
          <p>
            <strong>
              개인정보처리자: {DHARMA_BUSINESS.tradeName} ({DHARMA_BUSINESS.serviceName})
            </strong>
          </p>
          <p>
            대표자 {DHARMA_BUSINESS.representative} · 사업자등록번호 {DHARMA_BUSINESS.registrationNumber}
          </p>
          <p>
            서비스 운영에 필요한 범위에서 개인정보를 처리하며, 사업자 정보는 홈페이지 하단에 상시 표시합니다.
          </p>
        </article>

        <article className="card">
          <h2>수집하는 정보</h2>
          <table className="table">
            <thead>
              <tr>
                <th>구분</th>
                <th>수집 항목</th>
                <th>이용 목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>결제 정보</td>
                <td>결제 금액, 결제 상태, 구매 자료명</td>
                <td>결제 확인 및 다운로드 권한 부여</td>
              </tr>
              <tr>
                <td>다운로드 기록</td>
                <td>자료명, 다운로드 횟수, 다운로드 시각</td>
                <td>권한 관리 및 오류 문의 확인</td>
              </tr>
              <tr>
                <td>고객 문의 정보</td>
                <td>이름, 연락처, 문의 내용</td>
                <td>파일 오류 확인 및 원본 파일 제공 안내</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article className="card">
          <h2>개인정보 이용 목적</h2>
          <ul>
            <li>자료 결제 및 다운로드 권한 관리</li>
            <li>구매 내역 확인</li>
            <li>파일 오류 및 고객 문의 응대</li>
            <li>서비스 부정 이용 방지</li>
          </ul>
        </article>

        <article className="card">
          <h2>보관 및 삭제</h2>
          <p>결제 및 다운로드 기록은 서비스 운영과 고객 문의 대응을 위해 필요한 기간 동안 보관될 수 있습니다.</p>
          <p>고객이 개인정보 삭제를 요청하는 경우, 관련 법령 및 정산·분쟁 대응에 필요한 정보를 제외하고 삭제합니다.</p>
        </article>

        <article className="card">
          <h2>제3자 제공</h2>
          <p>다르마(DHARMA) AI는 고객의 개인정보를 무단으로 제3자에게 판매하거나 제공하지 않습니다.</p>
          <p>다만 결제 처리, 법령상 의무 이행, 고객 요청 처리에 필요한 경우 관련 서비스 제공자와 제한적으로 처리될 수 있습니다.</p>
        </article>
      </section>
      <DharmaBusinessFooter />
      {styleBlock}
    </main>
  );
}
