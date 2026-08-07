import { trustIndex } from "@/data/site";

function Stars({ count }: { count: number }) {
  return <span className="stars">{"★".repeat(count)}{"☆".repeat(5 - count)}</span>;
}

export function TrustIndex() {
  return (
    <section className="trustIndexBlock">
      <div className="sectionLabel">DHARMA TRUST INDEX™</div>
      <h2>보고서 품질을 한눈에 확인합니다.</h2>
      <div className="trustCard">
        {trustIndex.map(([label, score]) => (
          <div className="trustRow" key={label}><span>{label}</span><Stars count={Number(score)} /></div>
        ))}
        <div className="totalScore"><span>종합 신뢰도</span><strong>97 / 100</strong></div>
        <p className="note">본 지표는 DHARMA AI 내부 기준에 따라 생성 과정과 품질을 요약한 참고 지표입니다.</p>
      </div>
    </section>
  );
}
