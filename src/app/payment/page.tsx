'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { siteInfo } from '@/data/site';

export default function PaymentPage() {
  const [message, setMessage] = useState('');

  function requestPayment() {
    const key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

    if (!key) {
      setMessage('토스페이먼츠 승인 후 결제 키를 설정하면 결제창이 활성화됩니다. 현재는 결제 준비 화면입니다.');
      return;
    }

    setMessage('토스페이먼츠 결제창 연결 준비 완료. 실제 승인 키 입력 후 활성화됩니다.');
  }

  return (
    <>
      <Header />
      <main className="section white">
        <div className="formCard" style={{ maxWidth: 720, margin: '80px auto' }}>
          <h1 className="pageTitle">다르마(DHARMA) AI 결제</h1>
          <p>월 이용료: {siteInfo.monthlyFee}</p>
          <p>토스페이먼츠 승인 후 카드 · 토스페이 · 카카오페이 · 휴대폰결제를 연결합니다.</p>
          <button className="primaryButton" onClick={requestPayment}>결제 테스트</button>
          {message && <p className="loginNotice">{message}</p>}
          <hr />
          <p>계좌이체: {siteInfo.bank} {siteInfo.account}</p>
        </div>
      </main>
    </>
  );
}
