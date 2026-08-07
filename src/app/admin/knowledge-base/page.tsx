"use client";

import { useEffect, useState } from "react";

type Status = {
  ok?: boolean;
  exists?: boolean;
  message?: string;
  indexedAt?: string;
  totalFilesListed?: number;
  totalReadableFiles?: number;
  indexedFiles?: number;
  totalChunks?: number;
  subjects?: string[];
  sampleItems?: any[];
  errors?: string[];
};

export default function AdminKnowledgeBasePage() {
  const [status, setStatus] = useState<Status>({});
  const [loading, setLoading] = useState(false);

  async function loadStatus() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/knowledge-base/index?t=${Date.now()}`, {
        cache: "no-store",
      });
      const json = await response.json();
      setStatus(json);
    } catch {
      setStatus({
        ok: false,
        message: "Knowledge Base 상태를 불러오지 못했습니다. 본문 인덱싱 API가 적용되어 있는지 확인해 주세요.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <main style={{ padding: 48, fontFamily: "Arial, sans-serif", color: "#07152f" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, borderBottom: "1px solid #d9e7ff", paddingBottom: 18, marginBottom: 38 }}>
        <strong style={{ fontSize: 22 }}>DHARMA 관리자</strong>
        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap", fontWeight: 800 }}>
          <a href="/admin">관리자 홈</a>
          <a href="/admin/google-drive">Drive 동기화</a>
          <a href="/admin/knowledge-base/index">본문 인덱싱</a>
          <a href="/materials">자료 스토어</a>
          <a href="/admin/purchases">구매/다운로드</a>
          <a href="/">고객 홈페이지</a>
        </nav>
      </header>

      <div style={{ color: "#1165e8", letterSpacing: 3, fontWeight: 900 }}>ADMIN · KNOWLEDGE BASE</div>
      <h1 style={{ fontSize: 46 }}>Knowledge Base 관리</h1>
      <p style={{ fontSize: 20, lineHeight: 1.7 }}>
        Google Drive 동기화, 본문 인덱싱, 고객 자료 목록, 구매/다운로드 관리로 이동하는 관리자 메인 화면입니다.
      </p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16, marginTop: 28 }}>
        <div style={card}><strong style={num}>{status.totalFilesListed ?? 0}</strong><p>Drive 파일</p></div>
        <div style={card}><strong style={num}>{status.totalReadableFiles ?? 0}</strong><p>읽기 가능 자료</p></div>
        <div style={card}><strong style={num}>{status.indexedFiles ?? 0}</strong><p>색인 자료</p></div>
        <div style={card}><strong style={num}>{status.totalChunks ?? 0}</strong><p>본문 조각</p></div>
      </section>

      <section style={box}>
        <h2>관리자 작업</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a style={primary} href="/admin/knowledge-base/index">본문 인덱싱 실행</a>
          <a style={ghost} href="/admin/google-drive">Google Drive 동기화</a>
          <a style={ghost} href="/admin/google-drive/convert">Docs 변환</a>
          <a style={ghost} href="/materials">고객 자료 목록 확인</a>
          <a style={ghost} href="/admin/purchases">구매/다운로드 내역</a>
          <button style={ghost} onClick={loadStatus} disabled={loading}>
            {loading ? "확인 중..." : "상태 새로고침"}
          </button>
        </div>
      </section>

      <section style={notice}>
        <strong>Knowledge Base 상태</strong>
        <p>{status.message || "상태를 확인했습니다."}</p>
        {status.indexedAt && <p>마지막 인덱싱: {new Date(status.indexedAt).toLocaleString()}</p>}
      </section>

      {status.subjects && status.subjects.length > 0 && (
        <section style={box}>
          <h2>색인된 과목</h2>
          <p>{status.subjects.join(" · ")}</p>
        </section>
      )}

      {status.sampleItems && status.sampleItems.length > 0 && (
        <section style={box}>
          <h2>최근 색인 자료</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {status.sampleItems.map((item: any) => (
              <article style={card} key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.subject} / {item.unit}</p>
                <p>주제: {item.topic}</p>
                <p>핵심어: {(item.keywords || []).slice(0, 8).join(", ")}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const card = {
  border: "1px solid #d9e7ff",
  borderRadius: 24,
  padding: 26,
  background: "white",
  boxShadow: "0 18px 45px rgba(17, 101, 232, 0.08)",
};

const box = {
  border: "1px solid #d9e7ff",
  borderRadius: 24,
  padding: 30,
  background: "white",
  marginTop: 28,
  boxShadow: "0 18px 45px rgba(17, 101, 232, 0.08)",
};

const notice = {
  borderRadius: 20,
  padding: 22,
  background: "#eaf4ff",
  color: "#183f72",
  marginTop: 24,
};

const num = {
  display: "block",
  fontSize: 34,
  marginBottom: 10,
};

const primary = {
  display: "inline-block",
  padding: "15px 22px",
  borderRadius: 14,
  background: "#1977f3",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
  border: "0",
};

const ghost = {
  display: "inline-block",
  padding: "15px 22px",
  borderRadius: 14,
  background: "white",
  color: "#07152f",
  textDecoration: "none",
  fontWeight: 900,
  border: "1px solid #d9e7ff",
};
