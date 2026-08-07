"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";

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
  errors?: string[];
  sampleItems?: any[];
};

type RunResult = Status & {
  mode?: string;
  processed?: number;
  skippedUnchanged?: number;
};

export default function KnowledgeBaseIndexPage() {
  const [status, setStatus] = useState<Status>({});
  const [result, setResult] = useState<RunResult>({});
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(300);

  async function loadStatus() {
    const response = await fetch(`/api/admin/knowledge-base/index?t=${Date.now()}`, { cache: "no-store" });
    const json = await response.json();
    setStatus(json);
  }

  async function runIndex(mode: "incremental" | "rebuild") {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/knowledge-base/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ mode, limit }),
      });
      const json = await response.json();
      setResult(json);
      await loadStatus();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const display = result.ok ? result : status;

  return (
    <>
      <AdminHeader />
      <main className="section white">
        <div className="sectionLabel">ADMIN · KNOWLEDGE BASE INDEX</div>
        <h1 className="pageTitle">Knowledge Base 본문 인덱싱</h1>
        <p className="subText">
          Google Drive의 Google Docs 본문을 미리 읽고, 과목·단원·주제·핵심어로 자동 분류하여 보고서 생성용 색인을 만듭니다.
        </p>

        <div className="loginNotice">
          보고서 생성 시 Drive 전체를 다시 뒤지지 않고, 이 색인에서 필요한 자료만 검색합니다.
        </div>

        <div className="formCard" style={{ marginTop: 28 }}>
          <h2>인덱싱 실행</h2>
          <label>
            한 번에 처리할 최대 자료 수
            <input
              className="input"
              type="number"
              min={10}
              max={2000}
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value || 300))}
            />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <button className="primaryButton" disabled={loading} onClick={() => runIndex("incremental")}>
              {loading ? "인덱싱 중..." : "추가/업데이트 인덱싱"}
            </button>
            <button className="ghostButton" disabled={loading} onClick={() => runIndex("rebuild")}>
              전체 재색인
            </button>
            <button className="ghostButton" onClick={loadStatus} disabled={loading}>
              상태 새로고침
            </button>
            <a className="ghostButton" href="/report-lab">Report Lab 테스트</a>
          </div>
        </div>

        <div className="grid4" style={{ marginTop: 28 }}>
          <div className="card"><strong>{display.totalFilesListed ?? 0}</strong><p>Drive 파일</p></div>
          <div className="card"><strong>{display.totalReadableFiles ?? 0}</strong><p>읽기 가능 자료</p></div>
          <div className="card"><strong>{display.indexedFiles ?? 0}</strong><p>색인 자료</p></div>
          <div className="card"><strong>{display.totalChunks ?? 0}</strong><p>본문 조각</p></div>
        </div>

        {display.indexedAt && (
          <div className="loginNotice" style={{ marginTop: 24 }}>
            마지막 인덱싱: {new Date(display.indexedAt).toLocaleString()}
            {result.ok && (
              <>
                <p>이번 처리 자료: {result.processed ?? 0}개</p>
                <p>변경 없음으로 건너뜀: {result.skippedUnchanged ?? 0}개</p>
              </>
            )}
          </div>
        )}

        {status.subjects && status.subjects.length > 0 && (
          <div className="formCard" style={{ marginTop: 28 }}>
            <h2>색인된 과목</h2>
            <p>{status.subjects.join(" · ")}</p>
          </div>
        )}

        {display.sampleItems && display.sampleItems.length > 0 && (
          <div className="formCard" style={{ marginTop: 28 }}>
            <h2>최근 색인 자료</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {display.sampleItems.map((item: any) => (
                <div key={item.id} className="card">
                  <strong>{item.title}</strong>
                  <p>{item.subject} / {item.unit}</p>
                  <p>주제: {item.topic}</p>
                  <p>핵심어: {(item.keywords || []).slice(0, 8).join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {display.errors && display.errors.length > 0 && (
          <div className="formCard" style={{ marginTop: 28 }}>
            <h2>최근 오류</h2>
            <ul>
              {display.errors.map((error: string) => <li key={error}>{error}</li>)}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}
