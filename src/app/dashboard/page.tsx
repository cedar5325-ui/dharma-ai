import Link from "next/link";
import { Header } from "@/components/Header";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="section white">
        <div className="sectionLabel">CUSTOMER DASHBOARD</div>
        <h1 className="pageTitle">내 다르마 AI</h1>
        <p className="subText">
          보고서 생성, 이용권 확인, 생성 이력 관리를 위한 고객용 대시보드입니다.
        </p>

        <div className="grid3" style={{ marginTop: 32 }}>
          <div className="card">
            <strong>탐구보고서 생성</strong>
            <p>학생 정보와 희망 진로를 입력하고 보고서 구조를 생성합니다.</p>
            <Link className="primaryButton" href="/report-lab">보고서 생성</Link>
          </div>

          <div className="card">
            <strong>이용권 상태</strong>
            <p>현재는 결제 준비 단계입니다. 토스 승인 후 이용권 활성화와 연결됩니다.</p>
            <Link className="ghostButton" href="/payment">결제하기</Link>
          </div>

          <div className="card">
            <strong>자료 보호 원칙</strong>
            <p>고객 화면에는 원문, 원본 파일명, Drive 링크가 노출되지 않습니다.</p>
            <Link className="ghostButton" href="/knowledge-base">보호 원칙 보기</Link>
          </div>
        </div>
      </main>
    </>
  );
}
