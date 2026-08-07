"use client";

import { useEffect, useState } from "react";

const SUBJECTS = [
  "전체",
  "생명과학",
  "화학",
  "윤리와사상",
  "사회문제탐구",
  "수학",
  "국어",
  "영어",
  "물리",
  "지구과학",
  "정보",
  "분류 대기",
];

function formatBytes(value: number | null | undefined) {
  if (!value) return "";
  if (value < 1024) return value + "B";
  if (value < 1024 * 1024) return Math.round(value / 1024) + "KB";
  return (value / 1024 / 1024).toFixed(1) + "MB";
}

export default function MaterialsPage() {
  const [subject, setSubject] = useState("전체");
  const [query, setQuery] = useState("");
  const [materials, setMaterials] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadMaterials() {
    setLoading(true);
    setMessage("");

    try {
      const params = new URLSearchParams();
      if (subject && subject !== "전체") params.set("subject", subject);
      if (query.trim()) params.set("query", query.trim());

      const response = await fetch("/api/materials?" + params.toString() + "&t=" + Date.now(), {
        cache: "no-store",
      });

      const json = await response.json();

      setMaterials(Array.isArray(json.materials) ? json.materials : []);
      setTotal(Number(json.total || 0));
      setCount(Number(json.count || 0));
      setMessage(json.message || "");
    } catch (error) {
      setMaterials([]);
      setTotal(0);
      setCount(0);
      setMessage("자료 목록을 불러오지 못했습니다. Supabase 환경변수 또는 DB 연결을 확인하세요.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  return (
    <main className="page">
      <header className="header">
        <strong>다르마(DHARMA) AI</strong>
        <nav>
          <a href="/">홈</a>
          <a href="/materials">자료 다운로드</a>
          <a href="/pricing">요금</a>
          <a href="/admin/storage">관리자 Storage</a>
        </nav>
      </header>

      <section className="hero">
        <div className="label">SUPABASE STORAGE ORIGINAL MATERIALS</div>
        <h1>원문 파일 다운로드 자료</h1>
        <p>
          고객 다운로드는 Supabase Storage에 등록된 HWP/HWPX/DOCX 원문 파일을 기준으로 제공합니다.
        </p>
      </section>

      <section className="box">
        <h2>1. 관심 과목 선택</h2>
        <div className="chips">
          {SUBJECTS.map((item) => (
            <button
              key={item}
              className={item === subject ? "chip active" : "chip"}
              onClick={() => setSubject(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="box">
        <h2>2. 자료 제목 검색</h2>
        <label>제목 / 핵심어 검색</label>
        <div className="searchRow">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") loadMaterials();
            }}
            placeholder="예: 고전과윤리, 소논문, 이성질체"
          />
          <button onClick={loadMaterials}>자료 보기</button>
        </div>
      </section>

      <section className="list">
        <div className="label">SUPABASE STORAGE MATERIAL TITLES</div>
        <h2>{subject === "전체" ? "전체 자료" : subject + " 자료"}</h2>

        <p className="summary">
          {loading ? "자료를 불러오는 중입니다." : "총 " + total + "개의 원문 자료 중 " + count + "개가 표시됩니다."}
        </p>

        {message && <div className="notice">{message}</div>}

        {materials.length === 0 ? (
          <div className="empty">
            표시할 자료가 없습니다.
            <br />
            관리자 화면에서 파일 업로드 후 다시 확인하세요.
            <br />
            <a href="/admin/storage">관리자 업로드 화면으로 이동</a>
          </div>
        ) : (
          <div className="grid">
            {materials.map((item) => (
              <a key={item.id} className="card" href={"/materials/" + item.id}>
                <div className={Number(item.price || 0) >= 50000 ? "type premium" : "type"}>
                  {Number(item.price || 0) >= 50000 ? "소논문" : item.fileType || "파일"}
                </div>
                <h3>{item.title || item.fileName || "제목 없는 자료"}</h3>
                <p>{item.subject || "분류 대기"} · {item.unit || "단원 미분류"}</p>
                <p className="fileName">{item.fileName}</p>
                <strong>
                  {item.priceLabel || Number(item.price || 20000).toLocaleString("ko-KR") + "원"}
                  {item.sizeBytes ? " · " + formatBytes(item.sizeBytes) : ""}
                </strong>
              </a>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, #fff 0%, #f1f7ff 100%);
          color: #07152f;
          font-family: Arial, sans-serif;
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
          font-weight: 900;
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
        .hero, .box, .list {
          max-width: 1500px;
          margin: 0 auto;
          padding-left: 5vw;
          padding-right: 5vw;
        }
        .hero {
          padding-top: 70px;
          padding-bottom: 34px;
        }
        .label {
          color: #1165e8;
          letter-spacing: 4px;
          font-weight: 950;
          margin-bottom: 18px;
        }
        h1 {
          font-size: 60px;
          margin: 0 0 18px;
          letter-spacing: -0.05em;
        }
        .hero p {
          font-size: 21px;
          line-height: 1.7;
          color: #385173;
        }
        .box {
          background: white;
          border: 1px solid #d9e7ff;
          border-radius: 34px;
          padding-top: 34px;
          padding-bottom: 34px;
          margin-top: 28px;
          box-shadow: 0 22px 60px rgba(17,101,232,.08);
        }
        .chips {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 22px;
        }
        .chip {
          padding: 16px 24px;
          border-radius: 18px;
          border: 1px solid #d9e7ff;
          background: white;
          font-weight: 900;
          cursor: pointer;
        }
        .chip.active {
          background: #1977f3;
          color: white;
        }
        label {
          display: block;
          margin: 18px 0 10px;
          font-weight: 800;
        }
        .searchRow {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        input {
          padding: 18px 20px;
          border-radius: 18px;
          border: 1px solid #d9e7ff;
          min-width: 420px;
          font-size: 17px;
        }
        .searchRow button {
          padding: 18px 30px;
          border-radius: 18px;
          border: 0;
          background: #1977f3;
          color: white;
          font-weight: 950;
          cursor: pointer;
        }
        .list {
          margin-top: 44px;
          padding-bottom: 100px;
        }
        .list h2 {
          font-size: 46px;
          margin: 10px 0 18px;
        }
        .summary {
          font-size: 20px;
        }
        .notice, .empty {
          margin-top: 18px;
          padding: 22px;
          border-radius: 18px;
          background: #eaf4ff;
          color: #183f72;
          font-weight: 800;
          line-height: 1.7;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(260px, 1fr));
          gap: 20px;
          margin-top: 28px;
        }
        .card {
          display: block;
          padding: 28px;
          border-radius: 28px;
          background: white;
          border: 1px solid #d9e7ff;
          box-shadow: 0 18px 45px rgba(17,101,232,.08);
          color: #07152f;
          text-decoration: none;
        }
        .type {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 12px;
          background: #eaf4ff;
          color: #1977f3;
          font-weight: 950;
        }
        .type.premium {
          background: #e11931;
          color: white;
        }
        .card h3 {
          font-size: 24px;
          line-height: 1.4;
        }
        .fileName {
          color: #526b91;
          line-height: 1.5;
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }
          input {
            min-width: 100%;
          }
        }
      `}</style>
    </main>
  );
}


