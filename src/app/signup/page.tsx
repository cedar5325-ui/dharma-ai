'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  function signup() {
    localStorage.setItem('dharma_user_email', email || 'demo@dharma.ai');
    router.push('/dashboard');
  }

  return (
    <>
      <Header />
      <main className="section white">
        <div className="formCard" style={{ maxWidth: 560, margin: '80px auto' }}>
          <h1 className="pageTitle">회원가입</h1>
          <p>가입 후 탐구 설계와 결제 기능을 이용할 수 있습니다.</p>
          <label>이메일<input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></label>
          <label>비밀번호<input className="input" type="password" placeholder="비밀번호" /></label>
          <button className="primaryButton" onClick={signup} style={{ marginTop: 20 }}>회원가입</button>
          <p className="note">현재는 데모 회원가입입니다. 실제 인증 시스템은 다음 단계에서 연결합니다.</p>
        </div>
      </main>
    </>
  );
}
