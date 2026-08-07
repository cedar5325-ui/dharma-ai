"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";

type ConvertResult = {
  sourceName: string;
  sourceMimeType: string;
  status: string;
  reason?: string;
  newFileName?: string;
  webViewLink?: string;
};

type ConvertResponse = {
  ok?: boolean;
  message?: string;
  dryRun?: boolean;
  summary?: {
    totalScanned: number;
    wouldConvert: number;
    converted: number;
    skipped: number;
    failed: number;
  };
  results?: ConvertResult[];
};

export default function GoogleDocsConvertPage() {
  const [data, setData] = useState<ConvertResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(100);

  async function runConvert(dryRun: boolean) {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/google-drive/convert-docs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dryRun, limit }),
      });

      const json = await response.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminHeader />
      <main className="section white">
        <div className="sectionLabel">ADMIN · GOOGLE DOCS CONVERTER</div>
        <h1 className="pageTitle">Google Docs 변환</h1>
        <p className="subText">
          Google Drive에 있는 자료 중 변환 가능한 파일을 Google Docs 변환본으로 새로 생성합니다.
          원본 파일은 삭제하지 않습니다.
        </p>

        <div className="loginNotice">
          이 기능은 Google Drive 쓰기 권한이 필요합니다. 권한 오류가 나면 Google Drive 연결을 다시 진행하고 모든 권한을 허용해 주세요.
        </div>

        <div className="formCard" style={{ marginTop: 32 }}>
          <h2>변환 실행</h2>

          <label>
            한 번에 확인할 최대 파일 수
            <input
              className="input"
              type="number"
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value || 100))}
              min={1}
              max={500}
            />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <button className="ghostButton" disabled={loading} onClick={() => runConvert(true)}>
              {loading ? "확인 중..." : "변환 대상 미리보기"}
            </button>

            <button className="primaryButton" disabled={loading} onClick={() => runConvert(false)}>
              {loading ? "변환 중..." : "Google Docs로 변환 실행"}
            </button>

            <a className="ghostButton" href="/api/auth/google/login">
              Google Drive 다시 연결
            </a>
          </div>
        </div>

        {data?.message && (
          <div className="loginNotice" style={{ marginTop: 24 }}>
            {data.message}
          </div>
        )}

        {data?.summary && (
          <div className="grid4" style={{ marginTop: 28 }}>
            <div className="card"><strong>{data.summary.totalScanned}</strong><p>확인한 파일</p></div>
            <div className="card"><strong>{data.summary.wouldConvert}</strong><p>변환 가능</p></div>
            <div className="card"><strong>{data.summary.converted}</strong><p>변환 완료</p></div>
            <div className="card"><strong>{data.summary.failed}</strong><p>실패</p></div>
          </div>
        )}

        {data?.results && (
          <div className="formCard" style={{ marginTop: 28, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">원본 자료</th>
                  <th align="left">상태</th>
                  <th align="left">이유</th>
                  <th align="left">변환본</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((item, index) => (
                  <tr key={`${item.sourceName}-${index}`} style={{ borderTop: "1px solid #e1ecff" }}>
                    <td style={{ padding: "14px 8px" }}>{item.sourceName}</td>
                    <td>{item.status}</td>
                    <td>{item.reason}</td>
                    <td>
                      {item.webViewLink ? (
                        <a href={item.webViewLink} target="_blank">
                          {item.newFileName || "열기"}
                        </a>
                      ) : (
                        item.newFileName || "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
