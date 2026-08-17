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


export default function TermsPage() {
  return (
    <main className="page">
      <TopNav />
      <PageHeader
        eyebrow="TERMS OF USE"
        title="이용약관"
        description="다르마 자료 다운로드 서비스를 이용하기 전 반드시 확인해야 하는 기본 이용 조건입니다."
      />

      <section className="section">
        <article className="card">
          <h2>사업자 및 서비스 운영 주체</h2>
          <ul>
            <li>서비스명: {DHARMA_BUSINESS.serviceName}</li>
            <li>상호: {DHARMA_BUSINESS.tradeName}</li>
            <li>대표자: {DHARMA_BUSINESS.representative}</li>
            <li>사업자등록번호: {DHARMA_BUSINESS.registrationNumber}</li>
            <li>사업장 주소: {DHARMA_BUSINESS.address}</li>
          </ul>
        </article>

        <article className="card">
          <h2>서비스 목적</h2>
          <p>다르마(DHARMA) AI는 교과 연계 탐구, 도서 연계 탐구, 고등학교 교육과정 기반 심화 탐구에 활용할 수 있는 원문 자료 다운로드 서비스를 제공합니다.</p>
          <p>제공 자료는 학생의 탐구 방향 설정, 참고, 학습, 보고서 구성 이해를 돕기 위한 자료입니다.</p>
        </article>

        <article className="card">
          <h2>자료 이용 범위</h2>
          <ul>
            <li>구매한 자료는 구매자 본인의 학습 및 탐구 참고용으로만 사용할 수 있습니다.</li>
            <li>자료의 무단 공유, 복제, 배포, 판매, 재판매를 금지합니다.</li>
            <li>자료를 그대로 제출하거나 타인의 결과물로 위장하는 행위는 허용되지 않습니다.</li>
            <li>자료는 탐구 방향을 참고하고 재구성하여 활용해야 합니다.</li>
          </ul>
        </article>

        <article className="card">
          <h2>결제 및 다운로드</h2>
          <ul>
            <li>일반 탐구보고서는 1건당 20,000원입니다.</li>
            <li>소논문은 1건당 50,000원입니다.</li>
            <li>월 구독, 정기결제, 자동갱신은 운영하지 않습니다.</li>
            <li>결제 완료 후 해당 자료 1건의 다운로드 권한이 부여됩니다.</li>
            <li>파일 오류가 있는 경우 고객센터 문자 연락을 통해 확인을 요청할 수 있습니다.</li>
          </ul>
        </article>

        <article className="card">
          <h2>책임 제한</h2>
          <p>다르마(DHARMA) AI는 자료의 품질과 파일 제공을 위해 검토 절차를 운영하지만, 자료 활용 결과나 학교별 평가 결과를 보장하지 않습니다.</p>
          <p>자료는 참고용이며, 최종 탐구 결과물은 사용자가 자신의 이해와 표현으로 재구성해야 합니다.</p>
        </article>
      </section>
      <DharmaBusinessFooter />
      {styleBlock}
    </main>
  );
}
