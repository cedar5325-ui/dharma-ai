"use client";

export default function AdminHomePage() {
  return (
    <main style={{ padding: 48, fontFamily: "Arial, sans-serif", color: "#07152f" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: "1px solid #d9e7ff", paddingBottom: 18, marginBottom: 42 }}>
        <strong style={{ fontSize: 24 }}>DHARMA 관리자</strong>
        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap", fontWeight: 800 }}>
          <a href="/">고객 홈페이지</a>
          <a href="/materials">자료 스토어</a>
          <a href="/api/admin/logout">로그아웃</a>
        </nav>
      </header>

      <div style={{ color: "#1165e8", letterSpacing: 3, fontWeight: 900 }}>DHARMA ADMIN</div>
      <h1 style={{ fontSize: 52, margin: "20px 0 18px", letterSpacing: "-0.05em" }}>관리자 대시보드</h1>
      <p style={{ fontSize: 21, lineHeight: 1.7, maxWidth: 980 }}>
        Google Drive 자료 동기화, Knowledge Base 본문 인덱싱, 자료 판매, 구매/다운로드 내역을 관리하는 관리자 전용 화면입니다.
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(220px, 1fr))", gap: 22, marginTop: 42 }}>
        <article style={card}>
          <h2>Google Drive 동기화</h2>
          <p>전용 폴더와 하위 폴더의 자료 목록을 다시 불러옵니다.</p>
          <a style={primary} href="/admin/google-drive">동기화 관리</a>
        </article>

        <article style={card}>
          <h2>Knowledge Base 관리</h2>
          <p>색인 자료, 본문 조각, 과목 분류 상태를 확인합니다.</p>
          <a style={primary} href="/admin/knowledge-base">KB 관리</a>
        </article>

        <article style={card}>
          <h2>본문 인덱싱</h2>
          <p>Google Docs 본문을 읽어 과목·단원·핵심어로 자동 분류합니다.</p>
          <a style={primary} href="/admin/knowledge-base/index">본문 인덱싱</a>
        </article>

        <article style={card}>
          <h2>Docs 변환</h2>
          <p>본문 추출이 어려운 자료를 Google Docs 변환본으로 준비합니다.</p>
          <a style={ghost} href="/admin/google-drive/convert">Docs 변환</a>
        </article>

        <article style={card}>
          <h2>자료 스토어 확인</h2>
          <p>고객이 보는 과목별 자료 목록과 결제 흐름을 확인합니다.</p>
          <a style={ghost} href="/materials">자료 스토어</a>
        </article>

        <article style={card}>
          <h2>구매/다운로드 내역</h2>
          <p>자료 1건 20,000원 결제 요청과 다운로드 기록을 확인합니다.</p>
          <a style={ghost} href="/admin/purchases">구매 내역</a>
        </article>
      </section>

      <section style={notice}>
        <strong>관리자 화면 접속 순서</strong>
        <p>
          PC를 다시 켠 뒤에는 VS Code 터미널에서 <code>npm.cmd run dev</code>를 실행하고,
          먼저 <code>http://localhost:3000/admin</code>으로 접속하세요.
        </p>
      </section>
    </main>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #d9e7ff",
  borderRadius: 28,
  padding: 30,
  background: "white",
  boxShadow: "0 18px 45px rgba(17, 101, 232, 0.08)",
  minHeight: 230,
};

const primary: React.CSSProperties = {
  display: "inline-block",
  marginTop: 16,
  padding: "15px 22px",
  borderRadius: 14,
  background: "#1977f3",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
};

const ghost: React.CSSProperties = {
  display: "inline-block",
  marginTop: 16,
  padding: "15px 22px",
  borderRadius: 14,
  background: "white",
  color: "#07152f",
  textDecoration: "none",
  fontWeight: 900,
  border: "1px solid #d9e7ff",
};

const notice: React.CSSProperties = {
  marginTop: 36,
  padding: 26,
  borderRadius: 22,
  background: "#eaf4ff",
  color: "#183f72",
  fontSize: 18,
  lineHeight: 1.7,
};
