'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  function login() {
    if (!email) {
      setMessage('이메일을 입력해 주세요.');
      return;
    }

    localStorage.setItem('dharma_user_email', email);
    router.push('/dashboard');
  }

  return (
    <>
      <Header />
      <main className="section white">
        <div className="formCard" style={{ maxWidth: 560, margin: '80px auto' }}>
          <h1 className="pageTitle">로그인</h1>
          <p>다르마(DHARMA) AI 서비스를 이용하려면 로그인하세요.</p>
          <label>이메일<input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></label>
          <label>비밀번호<input className="input" type="password" placeholder="비밀번호" /></label>
          <button className="primaryButton" onClick={login} style={{ marginTop: 20 }}>로그인</button>
          {message && <p className="loginNotice">{message}</p>}
          <p className="note">현재는 데모 로그인입니다. 실제 회원 DB 연동은 다음 단계에서 연결합니다.</p>
        </div>
      </main>
    </>
  );
}
