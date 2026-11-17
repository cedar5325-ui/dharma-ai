'use client';

import type { CSSProperties, FormEvent } from 'react';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginLoading() {
  return (
    <main style={styles.page}>
      <section style={styles.card} aria-live="polite">
        <p style={styles.eyebrow}>DHARMA AI ADMIN</p>
        <h1 style={styles.title}>관리자 로그인 준비 중</h1>
        <p style={styles.description}>잠시만 기다려 주세요.</p>
      </section>
    </main>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requestedNext = searchParams.get('next') ?? '/admin';
  const nextPath = requestedNext.startsWith('/admin') ? requestedNext : '/admin';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (!password.trim()) {
      setMessage('관리자 비밀번호를 입력해 주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({
          password,
          adminPassword: password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;

      if (!response.ok || data?.ok === false) {
        throw new Error(
          data?.message ?? data?.error ?? '관리자 비밀번호가 올바르지 않습니다.',
        );
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '로그인 처리 중 오류가 발생했습니다.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logoMark} aria-hidden="true">D</div>
          <div>
            <p style={styles.eyebrow}>DHARMA AI ADMIN</p>
            <p style={styles.brandName}>다르마(DHARMA) AI</p>
          </div>
        </div>

        <h1 style={styles.title}>관리자 로그인</h1>
        <p style={styles.description}>
          관리자 전용 페이지입니다. 등록된 비밀번호를 입력해 주세요.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label htmlFor="admin-password" style={styles.label}>
            관리자 비밀번호
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            style={styles.input}
            placeholder="비밀번호 입력"
            autoFocus
          />

          {message ? (
            <p role="alert" style={styles.error}>
              {message}
            </p>
          ) : null}

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? '확인 중…' : '관리자 로그인'}
          </button>
        </form>

        <a href="/" style={styles.homeLink}>
          홈페이지로 돌아가기
        </a>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginLoading />}>
      <AdminLoginForm />
    </Suspense>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '32px 18px',
    background:
      'radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 34%), linear-gradient(145deg, #f8fafc 0%, #eef4ff 100%)',
    color: '#0f172a',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 24,
    border: '1px solid rgba(15, 23, 42, 0.09)',
    background: 'rgba(255, 255, 255, 0.96)',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.14)',
    padding: '36px 32px',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  logoMark: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    background: '#0f2f67',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: 22,
  },
  eyebrow: {
    margin: 0,
    color: '#2563eb',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.16em',
  },
  brandName: {
    margin: '3px 0 0',
    fontSize: 14,
    fontWeight: 700,
    color: '#334155',
  },
  title: {
    margin: 0,
    fontSize: 31,
    lineHeight: 1.25,
    letterSpacing: '-0.04em',
  },
  description: {
    margin: '12px 0 0',
    color: '#64748b',
    fontSize: 15,
    lineHeight: 1.7,
  },
  form: {
    display: 'grid',
    gap: 12,
    marginTop: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: 750,
    color: '#1e293b',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: 13,
    padding: '14px 15px',
    fontSize: 16,
    outline: 'none',
    background: '#ffffff',
    color: '#0f172a',
  },
  error: {
    margin: 0,
    borderRadius: 11,
    padding: '11px 12px',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 1.5,
  },
  button: {
    border: 0,
    borderRadius: 13,
    padding: '14px 16px',
    background: '#0f2f67',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
  },
  homeLink: {
    display: 'block',
    marginTop: 20,
    textAlign: 'center',
    color: '#475569',
    fontSize: 14,
    textDecoration: 'none',
  },
};
