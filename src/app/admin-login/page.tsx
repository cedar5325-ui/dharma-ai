"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || json.ok === false) {
        throw new Error(json.message || "관리자 로그인에 실패했습니다.");
      }

      window.location.href = "/admin/storage";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "관리자 로그인 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <div className="eyebrow">DHARMA ADMIN</div>
        <h1>관리자 로그인</h1>
        <p>
          관리자 기능은 자료 업로드, 구매 내역, 원문 파일 관리에 사용됩니다.
        </p>

        <form onSubmit={handleLogin}>
          <label>관리자 비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="관리자 비밀번호 입력"
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>

        {message && <div className="message">{message}</div>}

        <a href="/" className="homeLink">홈페이지로 돌아가기</a>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: linear-gradient(180deg, #ffffff 0%, #f1f7ff 100%);
          color: #07152f;
          font-family: Arial, sans-serif;
        }

        .card {
          width: 100%;
          max-width: 520px;
          padding: 42px;
          border-radius: 34px;
          background: white;
          border: 1px solid #d9e7ff;
          box-shadow: 0 24px 70px rgba(17, 101, 232, 0.12);
        }

        .eyebrow {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 4px;
          margin-bottom: 16px;
        }

        h1 {
          font-size: 46px;
          margin: 0 0 18px;
          letter-spacing: -0.05em;
        }

        p {
          font-size: 18px;
          line-height: 1.7;
          color: #385173;
        }

        form {
          margin-top: 28px;
        }

        label {
          display: block;
          font-weight: 900;
          margin-bottom: 10px;
        }

        input {
          width: 100%;
          padding: 18px 20px;
          border-radius: 18px;
          border: 1px solid #d9e7ff;
          font-size: 17px;
          outline: none;
        }

        button {
          width: 100%;
          margin-top: 18px;
          padding: 18px 24px;
          border: 0;
          border-radius: 18px;
          background: #1977f3;
          color: white;
          font-size: 18px;
          font-weight: 950;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .message {
          margin-top: 18px;
          padding: 16px;
          border-radius: 16px;
          background: #fff4e5;
          color: #7a3d00;
          font-weight: 800;
        }

        .homeLink {
          display: inline-block;
          margin-top: 22px;
          color: #1165e8;
          font-weight: 900;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
