import { Header } from "@/components/Header";

export default function PaymentFail() {
  return (
    <>
      <Header />
      <main className="section white">
        <h1 className="pageTitle">결제 실패</h1>
        <p>결제가 취소되었거나 실패했습니다.</p>
      </main>
    </>
  );
}
