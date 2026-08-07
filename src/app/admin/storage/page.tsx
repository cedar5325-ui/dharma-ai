"use client";

import { useRef, useState } from "react";

type UploadLog = {
  fileName: string;
  ok: boolean;
  message: string;
};

export default function AdminStoragePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [result, setResult] = useState<any>(null);

  async function uploadOneFile(file: File) {
    const formData = new FormData();
    formData.append("files", file);

    const response = await fetch("/api/admin/storage/upload", {
      method: "POST",
      body: formData,
    });

    let json: any = null;

    try {
      json = await response.json();
    } catch {
      json = {
        ok: false,
        message: "업로드 응답을 읽지 못했습니다.",
      };
    }

    if (!response.ok || !json.ok) {
      throw new Error(json?.failed?.[0]?.message || json?.message || "업로드 실패");
    }

    return json;
  }

  async function uploadFilesSequentially() {
    const selectedFiles = fileInputRef.current?.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      setResult({
        ok: false,
        message: "먼저 업로드할 파일을 선택하세요.",
      });
      return;
    }

    const files = Array.from(selectedFiles);

    setUploading(true);
    setProgress({ current: 0, total: files.length });
    setLogs([]);
    setResult(null);

    let successCount = 0;
    let failedCount = 0;
    const allResults: UploadLog[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      setProgress({ current: index + 1, total: files.length });

      try {
        const json = await uploadOneFile(file);

        successCount += 1;

        const uploaded = json?.uploaded?.[0];
        const priceLabel = uploaded?.priceLabel ? ` · ${uploaded.priceLabel}` : "";
        const sononmun = uploaded?.sononmun ? " · 소논문" : "";

        const log = {
          fileName: file.name,
          ok: true,
          message: `업로드 및 자료 등록 완료${sononmun}${priceLabel}`,
        };

        allResults.push(log);
        setLogs((prev) => [log, ...prev].slice(0, 80));
      } catch (error) {
        failedCount += 1;

        const log = {
          fileName: file.name,
          ok: false,
          message: error instanceof Error ? error.message : "업로드 실패",
        };

        allResults.push(log);
        setLogs((prev) => [log, ...prev].slice(0, 80));
      }
    }

    setResult({
      ok: failedCount === 0,
      total: files.length,
      successCount,
      failedCount,
      message:
        failedCount === 0
          ? "선택한 파일이 모두 업로드되었습니다."
          : "일부 파일 업로드에 실패했습니다. 실패 로그를 확인하세요.",
      results: allResults,
    });

    setUploading(false);
  }

  const percent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <main className="page">
      <header className="header">
        <strong>DHARMA 관리자</strong>
        <nav>
          <a href="/">홈페이지</a>
          <a href="/materials">자료 목록</a>
          <a href="/pricing">요금</a>
          <a href="/admin/purchases">구매 내역</a>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow">ADMIN · ORIGINAL FILE STORAGE</div>
        <h1>원문 파일 업로드 관리</h1>
        <p>
          HWP/HWPX/DOCX/PDF 원문 파일을 Supabase Storage에 업로드하고,
          고객 다운로드용 자료 목록에 자동 등록합니다.
        </p>
      </section>

      <section className="dashboardGrid">
        <article className="statusCard">
          <span>01</span>
          <h2>원문 파일 업로드</h2>
          <p>Google Docs 변환이 아니라 Supabase Storage 원문 파일을 다운로드용으로 등록합니다.</p>
        </article>

        <article className="statusCard">
          <span>02</span>
          <h2>가격 자동 분류</h2>
          <p>일반 자료는 20,000원, 파일명에 소논문이 포함되면 50,000원으로 등록됩니다.</p>
        </article>

        <article className="statusCard">
          <span>03</span>
          <h2>순차 업로드</h2>
          <p>여러 파일을 선택해도 서버로 한 번에 보내지 않고 1개씩 안전하게 업로드합니다.</p>
        </article>
      </section>

      <section className="warning">
        <strong>중요 안내</strong>
        <p>
          이 화면에서는 <b>선택 파일 순차 업로드</b>만 사용하세요.
          예전의 Storage 자료 동기화 방식은 원래 한글 파일명을 숫자 저장명으로 덮어쓸 수 있으므로 사용하지 않습니다.
        </p>
      </section>

      <section className="box">
        <div className="boxHeader">
          <div>
            <div className="smallLabel">UPLOAD</div>
            <h2>1. 원문 파일 선택</h2>
          </div>
          <div className="priceGuide">
            <strong>가격 기준</strong>
            <span>일반 20,000원 · 소논문 50,000원</span>
          </div>
        </div>

        <p>
          업로드할 HWP/HWPX/DOCX/PDF/PPTX/XLSX/ZIP 파일을 선택하세요.
          여러 개를 선택해도 내부적으로 1개씩 순차 업로드됩니다.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".hwp,.hwpx,.docx,.pdf,.pptx,.xlsx,.zip"
          disabled={uploading}
        />

        <div className="actions">
          <button onClick={uploadFilesSequentially} disabled={uploading}>
            {uploading ? "순차 업로드 중..." : "선택 파일 순차 업로드"}
          </button>

          <a href="/api/materials" target="_blank">
            자료 JSON 확인
          </a>

          <a href="/materials">
            고객 자료 화면 확인
          </a>

          <a href="/admin/purchases">
            구매 내역 확인
          </a>
        </div>

        {uploading && (
          <div className="progressBox">
            <div className="progressTop">
              <strong>
                업로드 진행: {progress.current} / {progress.total}
              </strong>
              <strong>{percent}%</strong>
            </div>
            <div className="barOuter">
              <div className="barInner" style={{ width: `${percent}%` }} />
            </div>
            <p>파일 수가 많으면 시간이 걸립니다. 완료될 때까지 창을 닫지 마세요.</p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="logs">
            <strong>최근 업로드 로그</strong>
            {logs.map((log, index) => (
              <div
                key={`${log.fileName}-${index}`}
                className={log.ok ? "log ok" : "log fail"}
              >
                {log.ok ? "성공" : "실패"} · {log.fileName} · {log.message}
              </div>
            ))}
          </div>
        )}

        {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      </section>

      <section className="box">
        <div className="smallLabel">CHECKLIST</div>
        <h2>2. 업로드 후 확인 순서</h2>
        <ol>
          <li>자료 JSON 확인에서 업로드 자료가 보이는지 확인합니다.</li>
          <li>고객 자료 화면에서 제목, 파일 형식, 가격이 정상 표시되는지 확인합니다.</li>
          <li>소논문 자료는 50,000원, 일반 자료는 20,000원인지 확인합니다.</li>
          <li>자료 상세 화면에서 결제 요청 → 테스트 결제 완료 → 원문 다운로드를 확인합니다.</li>
        </ol>

        <div className="actions">
          <a href="/materials">자료 목록으로 이동</a>
          <a href="/pricing">요금 페이지 확인</a>
          <a href="/refund">환불 안내 확인</a>
        </div>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

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
          background: rgba(255, 255, 255, 0.94);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header strong {
          font-size: 24px;
          font-weight: 950;
        }

        nav {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          font-weight: 900;
        }

        nav a {
          color: #07152f;
          text-decoration: none;
        }

        .hero,
        .dashboardGrid,
        .warning,
        .box {
          max-width: 1440px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero {
          padding: 70px 6vw 34px;
        }

        .eyebrow,
        .smallLabel {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 4px;
          margin-bottom: 16px;
        }

        h1 {
          font-size: clamp(48px, 6vw, 76px);
          letter-spacing: -0.055em;
          line-height: 1.05;
          margin: 0 0 18px;
        }

        .hero p,
        .box p,
        .warning p,
        li {
          font-size: 20px;
          line-height: 1.75;
          color: #385173;
        }

        .dashboardGrid {
          padding: 0 6vw;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .statusCard {
          background: white;
          border: 1px solid #d9e7ff;
          border-radius: 30px;
          padding: 30px;
          box-shadow: 0 22px 60px rgba(17,101,232,.08);
        }

        .statusCard span {
          display: inline-flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #1977f3;
          color: white;
          font-weight: 950;
          font-size: 20px;
          margin-bottom: 18px;
        }

        .statusCard h2 {
          font-size: 28px;
          margin: 0 0 12px;
          letter-spacing: -0.04em;
        }

        .statusCard p {
          font-size: 18px;
          line-height: 1.7;
          color: #385173;
          margin: 0;
        }

        .warning {
          padding: 26px 32px;
          border-radius: 26px;
          background: #fff4e5;
          color: #7a3d00;
          border: 1px solid #ffd59b;
          margin-bottom: 28px;
        }

        .warning strong {
          font-size: 24px;
          display: block;
          margin-bottom: 8px;
        }

        .box {
          padding: 34px;
          border-radius: 32px;
          background: white;
          border: 1px solid #d9e7ff;
          box-shadow: 0 22px 60px rgba(17,101,232,.08);
          margin-bottom: 28px;
        }

        .boxHeader {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .box h2 {
          font-size: 36px;
          margin: 0 0 14px;
          letter-spacing: -0.04em;
        }

        .priceGuide {
          padding: 18px 22px;
          border-radius: 20px;
          background: #eaf4ff;
          color: #183f72;
          font-weight: 900;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .priceGuide span {
          color: #e11931;
          font-weight: 950;
        }

        input {
          display: block;
          margin-top: 20px;
          padding: 18px;
          width: 100%;
          max-width: 760px;
          border-radius: 16px;
          border: 1px solid #d9e7ff;
          background: #f8fbff;
          font-size: 16px;
        }

        .actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        button,
        .actions a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 24px;
          border-radius: 16px;
          border: 0;
          background: #1977f3;
          color: white;
          font-weight: 950;
          text-decoration: none;
          cursor: pointer;
          font-size: 16px;
        }

        .actions a {
          background: white;
          color: #07152f;
          border: 1px solid #d9e7ff;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .progressBox {
          margin-top: 24px;
          padding: 22px;
          border-radius: 20px;
          background: #eaf4ff;
          color: #183f72;
        }

        .progressTop {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
        }

        .barOuter {
          margin-top: 14px;
          height: 16px;
          border-radius: 99px;
          background: white;
          border: 1px solid #d9e7ff;
          overflow: hidden;
        }

        .barInner {
          height: 100%;
          background: linear-gradient(90deg, #1977f3 0%, #00a3ff 100%);
          transition: width 0.2s ease;
        }

        .logs {
          margin-top: 24px;
          padding: 20px;
          border-radius: 20px;
          background: #f8fbff;
          border: 1px solid #d9e7ff;
        }

        .logs strong {
          display: block;
          margin-bottom: 12px;
        }

        .log {
          margin-top: 10px;
          font-size: 15px;
          line-height: 1.5;
        }

        .log.ok {
          color: #0f7a3b;
        }

        .log.fail {
          color: #b42318;
        }

        pre {
          margin-top: 24px;
          padding: 22px;
          border-radius: 20px;
          background: #07152f;
          color: #dcecff;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        ol {
          padding-left: 26px;
        }

        @media (max-width: 900px) {
          .dashboardGrid {
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
    </main>
  );
}
