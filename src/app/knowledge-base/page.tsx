import Link from "next/link";
import { Header } from "@/components/Header";

export default function CustomerKnowledgeBaseNoticePage() {
  return (
    <>
      <Header />
      <main className="section white">
        <div className="sectionLabel">DHARMA Knowledge Base™</div>
        <h1 className="pageTitle">Knowledge Base는 비공개 운영됩니다</h1>
        <p className="subText">
          다르마 AI의 Knowledge Base는 내부 검증 시스템입니다.
          고객 화면에서는 원문, 원본 파일명, Google Drive 링크가 노출되지 않습니다.
        </p>

        <div className="grid3" style={{ marginTop: 32 }}>
          <div className="card">
            <strong>원문 비공개</strong>
            <p>자료 내용은 고객에게 직접 표시되지 않습니다.</p>
          </div>
          <div className="card">
            <strong>파일명 비공개</strong>
            <p>내부 자료명과 민감한 파일명은 노출되지 않습니다.</p>
          </div>
          <div className="card">
            <strong>분석 후 재구성</strong>
            <p>검증된 구조와 메타데이터만 보고서 설계에 활용됩니다.</p>
          </div>
        </div>

        <div className="formCard" style={{ marginTop: 32 }}>
          <h2>보고서 생성은 Report Lab에서 진행됩니다</h2>
          <p className="subText">
            고객은 내부 자료 목록을 직접 보는 대신, 다르마 AI가 재구성한 탐구보고서 설계 기능을 이용합니다.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="primaryButton" href="/report-lab">보고서 생성 활용</Link>
            <Link className="ghostButton" href="/">홈으로 이동</Link>
          </div>
        </div>
      </main>
    </>
  );
}
