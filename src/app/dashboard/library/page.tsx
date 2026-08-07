import { AppShell } from "@/components/AppShell";

const kbSamples = [
  {
    title: "교과 연계 탐구 자료",
    description: "고등학교 교육과정의 핵심 개념에서 출발해 심화 탐구로 확장되는 자료입니다.",
    tag: "Curriculum",
  },
  {
    title: "도서 연계 탐구 자료",
    description: "탐구 주제와 관련 도서 활동을 연결해 독서 기반 탐구 흐름을 강화합니다.",
    tag: "Book Link",
  },
  {
    title: "소논문 프리미엄 자료",
    description: "파일명에 소논문이 포함된 심화형 원문 자료는 50,000원으로 분류됩니다.",
    tag: "Premium",
  },
];

export default function LibraryPage() {
  return (
    <AppShell>
      <main style={{ padding: 36, color: "#07152f" }}>
        <div style={{ color: "#1165e8", fontWeight: 900, letterSpacing: 3 }}>
          DHARMA KNOWLEDGE BASE
        </div>
        <h1 style={{ fontSize: 46, margin: "18px 0", letterSpacing: "-0.05em" }}>
          DHARMA Knowledge Base™
        </h1>
        <p style={{ fontSize: 20, lineHeight: 1.7, maxWidth: 900, color: "#385173" }}>
          교과 연계, 도서 연계, 교육과정 기반 심화 탐구 자료를 관리하는 지식베이스 화면입니다.
        </p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(220px, 1fr))", gap: 20, marginTop: 34 }}>
          {kbSamples.map((item) => (
            <article key={item.title} style={{ padding: 28, borderRadius: 28, background: "white", border: "1px solid #d9e7ff", boxShadow: "0 18px 45px rgba(17, 101, 232, 0.08)" }}>
              <div style={{ display: "inline-block", padding: "8px 12px", borderRadius: 12, background: "#eaf4ff", color: "#1165e8", fontWeight: 900, marginBottom: 14 }}>
                {item.tag}
              </div>
              <h2 style={{ fontSize: 26, margin: "0 0 12px" }}>{item.title}</h2>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "#385173" }}>{item.description}</p>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
