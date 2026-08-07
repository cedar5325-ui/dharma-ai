"use client";

import { useState } from "react";

export default function AdminGoogleDrivePage() {
  const [status, setStatus] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState("");

  async function checkStatus() {
    setLoading("status");
    setSyncResult(null);

    try {
      const response = await fetch(`/api/drive/status?t=${Date.now()}`, { cache: "no-store" });
      const json = await response.json();
      setStatus(json);
    } catch {
      setStatus({ ok: false, message: "Google Drive 상태 확인 중 오류가 발생했습니다." });
    } finally {
      setLoading("");
    }
  }

  async function runSync() {
    setLoading("sync");

    try {
      const response = await fetch(`/api/drive/sync?t=${Date.now()}`, { cache: "no-store" });
      const json = await response.json();
      setSyncResult(json);
    } catch {
      setSyncResult({ ok: false, message: "Google Drive 동기화 중 오류가 발생했습니다." });
    } finally {
      setLoading("");
    }
  }

  return (
    <main style={{ padding: 48, fontFamily: "Arial, sans-serif", color: "#07152f" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, borderBottom: "1px solid #d9e7ff", paddingBottom: 18, marginBottom: 42 }}>
        <strong style={{ fontSize: 24 }}>DHARMA 관리자</strong>
        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap", fontWeight: 800 }}>
          <a href="/admin">관리자 홈</a>
          <a href="/admin/knowledge-base">Knowledge Base</a>
          <a href="/admin/knowledge-base/index">본문 인덱싱</a>
          <a href="/materials">자료 스토어</a>
          <a href="/">고객 홈페이지</a>
        </nav>
      </header>

      <div style={{ color: "#1165e8", letterSpacing: 3, fontWeight: 900 }}>ADMIN · GOOGLE DRIVE</div>
      <h1 style={{ fontSize: 52, margin: "20px 0 18px", letterSpacing: "-0.05em" }}>Google Drive 동기화</h1>

      <p style={{ fontSize: 21, lineHeight: 1.7, maxWidth: 980 }}>
        Google Drive 연결 상태를 확인하고, 전용 폴더와 하위 폴더의 자료 목록을 다시 불러옵니다.
      </p>

      <section style={notice}>
        <strong>최소 복구용 Google Drive 관리자 화면입니다.</strong>
        <p>이 화면이 열리면 라우팅은 정상입니다. 이후 Drive 상태 확인과 동기화를 다시 진행하세요.</p>
      </section>

      <section style={box}>
        <h2>1. Google Drive 연결</h2>
        <p>PC를 다시 켰거나 쿠키가 삭제된 경우 Google Drive 연결이 끊길 수 있습니다.</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <button style={primary} onClick={checkStatus} disabled={loading === "status"}>
            {loading === "status" ? "확인 중..." : "상태 확인"}
          </button>
          <a style={ghost} href="/api/auth/google/login">Google Drive 다시 연결</a>
          <a style={ghost} href="/api/drive/status" target="_blank">상태 JSON 직접 보기</a>
        </div>

        {status && <pre style={pre}>{JSON.stringify(status, null, 2)}</pre>}
      </section>

      <section style={box}>
        <h2>2. Google Drive 동기화</h2>
        <p>연결 상태가 <strong>connected: true</strong>로 확인된 뒤 동기화를 실행하세요.</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <button style={primary} onClick={runSync} disabled={loading === "sync"}>
            {loading === "sync" ? "동기화 중..." : "Google Drive 동기화"}
          </button>
          <a style={ghost} href="/api/drive/sync" target="_blank">동기화 JSON 직접 보기</a>
        </div>

        {syncResult && <pre style={pre}>{JSON.stringify(syncResult, null, 2)}</pre>}
      </section>

      <section style={box}>
        <h2>3. 다음 작업</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <a style={primary} href="/admin/knowledge-base/index">본문 인덱싱으로 이동</a>
          <a style={ghost} href="/materials">고객 자료 목록 확인</a>
          <a style={ghost} href="/admin/purchases">구매/다운로드 내역</a>
        </div>
      </section>
    </main>
  );
}

const box = {
  border: "1px solid #d9e7ff",
  borderRadius: 28,
  padding: 30,
  background: "white",
  marginTop: 28,
  boxShadow: "0 18px 45px rgba(17, 101, 232, 0.08)",
};

const notice = {
  marginTop: 30,
  padding: 24,
  borderRadius: 22,
  background: "#eaf4ff",
  color: "#183f72",
  fontSize: 18,
  lineHeight: 1.7,
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
  cursor: "pointer",
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

const pre = {
  marginTop: 20,
  padding: 20,
  borderRadius: 18,
  background: "#07152f",
  color: "#dcecff",
  overflowX: "auto" as const,
  whiteSpace: "pre-wrap" as const,
};

