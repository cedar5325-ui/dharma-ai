import { Header } from "@/components/Header";

export default function PaymentSuccess() {
  return (
    <>
      <Header />
      <main className="section white">
        <h1 className="pageTitle">결제 성공</h1>
        <p>토스페이먼츠 승인 API 연결 후 이용권을 활성화합니다.</p>
      </main>
    </>
  );
}
