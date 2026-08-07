import { AppShell } from "@/components/AppShell";

const sampleTopics = [
  {
    subject: "수학",
    title: "순열과 조합을 활용한 이성질체 개수 분석",
    description: "교과 개념을 실제 화학 구조 분석과 연결하는 융합형 탐구 주제입니다.",
  },
  {
    subject: "윤리와사상",
    title: "고전과윤리 기반 사회 문제 탐구",
    description: "고전 윤리 사상을 현대 사회 문제와 연결해 비판적으로 분석합니다.",
  },
  {
    subject: "정보",
    title: "국제 유가와 환율 변동이 기업 수익성에 미치는 영향",
    description: "데이터 분석과 경제적 해석을 결합한 소논문형 탐구 주제입니다.",
  },
];

export default function TopicsPage() {
  return (
    <AppShell>
      <main style={{ padding: 36, color: "#07152f" }}>
        <div style={{ color: "#1165e8", fontWeight: 900, letterSpacing: 3 }}>
          DHARMA TOPIC RECOMMENDATION
        </div>
        <h1 style={{ fontSize: 46, margin: "18px 0", letterSpacing: "-0.05em" }}>
          경험과 합격생의 데이터를 기반으로 한 주제 추천
        </h1>
        <p style={{ fontSize: 20, lineHeight: 1.7, maxWidth: 900, color: "#385173" }}>
          교과 수업에서 출발해 심화 탐구, 관련 도서 활동, 느낀점까지 이어질 수 있는 주제를 추천합니다.
        </p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(220px, 1fr))", gap: 20, marginTop: 34 }}>
          {sampleTopics.map((item) => (
            <article key={item.title} style={{ padding: 28, borderRadius: 28, background: "white", border: "1px solid #d9e7ff", boxShadow: "0 18px 45px rgba(17, 101, 232, 0.08)" }}>
              <div style={{ display: "inline-block", padding: "8px 12px", borderRadius: 12, background: "#eaf4ff", color: "#1165e8", fontWeight: 900, marginBottom: 14 }}>
                {item.subject}
              </div>
              <h2 style={{ fontSize: 25, margin: "0 0 12px", lineHeight: 1.35 }}>{item.title}</h2>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#385173" }}>{item.description}</p>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
