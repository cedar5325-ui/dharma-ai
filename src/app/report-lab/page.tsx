"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";

type KBItem = {
  id: string;
  displayName: string;
  subject: string;
  sourceType: string;
  difficulty: string;
  keywords: string[];
  careerFit: string[];
  policy: string;
};

type ReportInput = {
  studentName: string;
  grade: string;
  schoolType: string;
  targetMajor: string;
  subject: string;
  unit: string;
  interest: string;
  reportType: string;
  topic: string;
  priorActivity: string;
  readingSource: string;
  referenceHint: string;
  researchPapers: string;
  siteUrls: string;
};

type Diagnostics = {
  totalFilesListed?: number;
  candidateFiles?: number;
  googleDocsCount?: number;
  convertedDocsCount?: number;
  textLikeCount?: number;
  attemptedReadCount?: number;
  extractedCount?: number;
  skippedNoTextCount?: number;
  skippedUnsupportedCount?: number;
  readableBeforeSubjectFilter?: number;
  rejectedBySubjectCount?: number;
  subjectProfile?: string;
  sampleCandidates?: string[];
  sampleUnsupported?: string[];
  sampleRejectedBySubject?: string[];
  message?: string;
};

const defaultInput: ReportInput = {
  studentName: "",
  grade: "고등학교 1학년",
  schoolType: "일반고",
  targetMajor: "",
  subject: "",
  unit: "",
  interest: "",
  reportType: "Google Drive 자료 기반 학교 제출용 약식 논문",
  topic: "",
  priorActivity: "",
  readingSource: "",
  referenceHint: "",
  researchPapers: "",
  siteUrls: "",
};

export default function ReportLabPage() {
  const [items, setItems] = useState<KBItem[]>([]);
  const [input, setInput] = useState<ReportInput>(defaultInput);
  const [topics, setTopics] = useState<string[]>([]);
  const [report, setReport] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningTopic, setRunningTopic] = useState("");

  async function loadItems() {
    try {
      const response = await fetch("/api/knowledge-base", { cache: "no-store" });
      const json = await response.json();

      if (!json.ok) {
        setMessage(json.message || "관리자 페이지에서 자료 동기화를 먼저 진행해 주세요.");
        return;
      }

      setItems(json.items || []);
    } catch {
      setMessage("Knowledge Base 상태를 불러오지 못했습니다.");
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function updateInput(key: keyof ReportInput, value: string) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const autoSelectedItems = useMemo(() => {
    const subject = input.subject.trim();
    const major = input.targetMajor.trim();
    const interest = input.interest.trim();
    const unit = input.unit.trim();

    const scored = items.map((item) => {
      let score = 0;

      if (subject && item.subject.includes(subject)) score += 5;
      if (unit && item.keywords.some((keyword) => unit.includes(keyword) || keyword.includes(unit))) score += 4;
      if (interest && item.keywords.some((keyword) => interest.includes(keyword) || keyword.includes(interest))) score += 4;
      if (major && item.careerFit.some((career) => major.includes(career) || career.includes(major))) score += 3;
      if (item.difficulty === "심화") score += 2;
      if (item.difficulty === "중상") score += 1;

      return { item, score };
    });

    const matched = scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, 8);

    if (matched.length > 0) return matched;

    return items.slice(0, 6);
  }, [items, input.subject, input.targetMajor, input.interest, input.unit]);

  function validateInput() {
    if (!input.targetMajor.trim()) return "희망 진로를 입력해 주세요.";
    if (!input.subject.trim()) return "과목을 입력해 주세요.";
    if (!input.unit.trim()) return "단원 또는 핵심 개념을 입력해 주세요.";
    return "";
  }

  async function recommend() {
    setMessage("");
    setReport(null);
    setDiagnostics(null);

    const error = validateInput();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);
    setRunningTopic("");

    try {
      const response = await fetch("/api/report/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ input, items: autoSelectedItems }),
      });

      const json = await response.json();

      if (!json.ok) {
        setMessage(json.message || "주제 추천에 실패했습니다.");
        return;
      }

      setTopics(json.topics || []);
      setMessage("추천 주제가 생성되었습니다. 원하는 주제를 누르면 바로 보고서 생성이 실행됩니다.");
    } catch {
      setMessage("주제 추천 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function generate(topicOverride?: string) {
    setMessage("");
    setDiagnostics(null);
    setReport(null);

    const error = validateInput();
    if (error) {
      setMessage(error);
      return;
    }

    const finalTopic = (topicOverride || input.topic || "").trim();

    if (!finalTopic) {
      setMessage("추천 주제를 선택하거나 최종 주제를 직접 입력해 주세요.");
      return;
    }

    setInput((prev) => ({ ...prev, topic: finalTopic }));
    setLoading(true);
    setRunningTopic(finalTopic);

    try {
      const response = await fetch("/api/report/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          input: {
            ...input,
            topic: finalTopic,
            selectedItems: autoSelectedItems,
          },
        }),
      });

      const json = await response.json();

      if (!json.ok) {
        setDiagnostics(json.diagnostics || null);
        setMessage(json.message || "보고서 생성에 실패했습니다.");
        setTimeout(() => {
          document.getElementById("drive-diagnostics")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return;
      }

      setReport(json);
      setDiagnostics(json.diagnostics || null);
      setMessage("보고서 생성이 완료되었습니다.");

      setTimeout(() => {
        document.getElementById("generated-report")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setMessage("보고서 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setRunningTopic("");
    }
  }

  async function copyPlainText() {
    if (!report?.plainText) return;
    await navigator.clipboard.writeText(report.plainText);
    setMessage("학교 제출용 보고서 본문을 클립보드에 복사했습니다.");
  }

  function downloadText() {
    if (!report?.plainText) return;

    const blob = new Blob([report.plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Google_Drive_자료기반_학교제출용_보고서.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Header />
      <main className="section white">
        <div className="sectionLabel">DRIVE ONLY REPORT LAB</div>
        <h1 className="pageTitle">Google Drive 자료 기반 보고서 생성</h1>
        <p className="subText">
          보고서는 Google Drive에서 본문 추출이 가능한 자료만 사용합니다.
          추천 주제를 누르면 즉시 해당 주제로 보고서 생성이 실행됩니다.
        </p>

        <div className="formCard" style={{ marginTop: 32 }}>
          <h2>학생 정보</h2>
          <div className="grid3">
            <label>
              학생 이름
              <input className="input" value={input.studentName} onChange={(e) => updateInput("studentName", e.target.value)} placeholder="선택 입력" />
            </label>
            <label>
              학년
              <select className="input" value={input.grade} onChange={(e) => updateInput("grade", e.target.value)}>
                <option>고등학교 1학년</option>
                <option>고등학교 2학년</option>
                <option>고등학교 3학년</option>
                <option>중학교</option>
              </select>
            </label>
            <label>
              학교 유형
              <select className="input" value={input.schoolType} onChange={(e) => updateInput("schoolType", e.target.value)}>
                <option>일반고</option>
                <option>자율형사립고</option>
                <option>특목고</option>
                <option>국제학교/해외고</option>
                <option>중학교</option>
              </select>
            </label>
          </div>

          <div className="grid3" style={{ marginTop: 18 }}>
            <label>
              희망 진로
              <input className="input" value={input.targetMajor} onChange={(e) => updateInput("targetMajor", e.target.value)} placeholder="예: 의예과, 약학과, 컴퓨터공학" />
            </label>
            <label>
              과목
              <input className="input" value={input.subject} onChange={(e) => updateInput("subject", e.target.value)} placeholder="예: 생명과학, 고급생명, 화학, 윤리와사상" />
            </label>
            <label>
              단원 / 개념
              <input className="input" value={input.unit} onChange={(e) => updateInput("unit", e.target.value)} placeholder="예: 막전위, 알츠하이머, pH, 사회현상" />
            </label>
          </div>

          <div className="grid3" style={{ marginTop: 18 }}>
            <label>
              관심 분야
              <input className="input" value={input.interest} onChange={(e) => updateInput("interest", e.target.value)} placeholder="예: 신경세포, 활동전위, 타우 단백질" />
            </label>
            <label>
              보고서 유형
              <select className="input" value={input.reportType} onChange={(e) => updateInput("reportType", e.target.value)}>
                <option>Google Drive 자료 기반 학교 제출용 약식 논문</option>
                <option>탐구보고서</option>
                <option>세특 연계 보고서</option>
                <option>진로활동 보고서</option>
              </select>
            </label>
            <label>
              최종 주제
              <input className="input" value={input.topic} onChange={(e) => updateInput("topic", e.target.value)} placeholder="추천 주제를 선택하거나 직접 입력" />
            </label>
          </div>

          <div style={{ marginTop: 22 }}>
            <label>
              이전 탐구 / 활동 연계
              <textarea
                className="input"
                style={{ minHeight: 90, resize: "vertical" }}
                value={input.priorActivity}
                onChange={(e) => updateInput("priorActivity", e.target.value)}
                placeholder="예: 생명과학 수업에서 신경세포의 흥분 전달을 학습하며 막전위 변화가 알츠하이머와 같은 신경계 질환과 어떻게 연결되는지 궁금해졌다."
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
            <button className="ghostButton" onClick={recommend} disabled={loading}>
              {loading ? "처리 중..." : "주제 추천"}
            </button>
            <button className="primaryButton" onClick={() => generate()} disabled={loading}>
              {loading ? "생성 중..." : "최종 주제로 보고서 생성"}
            </button>
            <a className="ghostButton" href="/admin/google-drive/convert">Docs 변환</a>
            <a className="ghostButton" href="/admin/google-drive">Drive 동기화</a>
          </div>

          {message && <p className="loginNotice">{message}</p>}
        </div>

        {topics.length > 0 && (
          <div className="formCard" style={{ marginTop: 28 }}>
            <h2>추천 주제</h2>
            <p className="subText">
              원하는 주제를 누르면 최종 주제로 자동 입력되고, 바로 보고서 생성이 실행됩니다.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {topics.map((topic) => (
                <button
                  key={topic}
                  className="ghostButton"
                  style={{ textAlign: "center", fontWeight: 800 }}
                  onClick={() => generate(topic)}
                  disabled={loading}
                >
                  {runningTopic === topic ? "보고서 생성 중..." : topic}
                  <span style={{ display: "block", fontSize: 14, fontWeight: 500, marginTop: 6 }}>
                    이 주제로 바로 보고서 생성
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {diagnostics && (
          <div id="drive-diagnostics" className="formCard" style={{ marginTop: 28 }}>
            <h2>Drive 본문 추출 진단</h2>
            <p className="subText">{diagnostics.message}</p>

            <div className="grid4" style={{ marginTop: 18 }}>
              <div className="card"><strong>{diagnostics.totalFilesListed ?? 0}</strong><p>전체 파일</p></div>
              <div className="card"><strong>{diagnostics.googleDocsCount ?? 0}</strong><p>Google Docs</p></div>
              <div className="card"><strong>{diagnostics.candidateFiles ?? 0}</strong><p>과목 일치 후보</p></div>
              <div className="card"><strong>{diagnostics.extractedCount ?? 0}</strong><p>본문 추출 성공</p></div>
            </div>

            <div className="grid4" style={{ marginTop: 18 }}>
              <div className="card"><strong>{diagnostics.subjectProfile || "-"}</strong><p>감지 과목</p></div>
              <div className="card"><strong>{diagnostics.readableBeforeSubjectFilter ?? 0}</strong><p>읽기 가능 자료</p></div>
              <div className="card"><strong>{diagnostics.rejectedBySubjectCount ?? 0}</strong><p>과목 불일치 제외</p></div>
              <div className="card"><strong>{diagnostics.skippedNoTextCount ?? 0}</strong><p>본문 부족/실패</p></div>
            </div>

            <div className="grid2" style={{ marginTop: 24 }}>
              <div className="card">
                <strong>과목 일치 후보 파일 예시</strong>
                {(diagnostics.sampleCandidates || []).length > 0 ? (
                  <ul>
                    {(diagnostics.sampleCandidates || []).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p>과목 일치 후보가 없습니다.</p>
                )}
              </div>

              <div className="card">
                <strong>과목 불일치로 제외된 파일 예시</strong>
                {(diagnostics.sampleRejectedBySubject || []).length > 0 ? (
                  <ul>
                    {(diagnostics.sampleRejectedBySubject || []).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p>과목 불일치 제외 예시가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {report?.ok && (
          <div id="generated-report" className="formCard" style={{ marginTop: 36 }}>
            <div className="sectionLabel">DRIVE BASED GENERATED REPORT</div>
            <h2 style={{ fontSize: 34 }}>{report.title}</h2>

            <div className="grid3" style={{ marginTop: 22 }}>
              <div className="card">
                <strong>{report.trustIndex.total}</strong>
                <p>자료 기반 완성도</p>
              </div>
              <div className="card">
                <strong>{report.sourceUseStatus?.driveEvidenceCount ?? report.selectedPublicSources?.length ?? 0}</strong>
                <p>Drive 자료 활용</p>
              </div>
              <div className="card">
                <strong>{report.meta?.sourcePolicy || "Drive 전용"}</strong>
                <p>생성 정책</p>
              </div>
            </div>

            {report.sections.map((section: any) => (
              <div key={section.title} style={{ borderTop: "1px solid #e1ecff", padding: "22px 0" }}>
                <strong style={{ fontSize: 22 }}>{section.title}</strong>
                <p style={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>{section.content}</p>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
              <button className="primaryButton" onClick={copyPlainText}>학교 제출용 본문 복사</button>
              <button className="ghostButton" onClick={downloadText}>TXT 저장</button>
            </div>

            <p className="note" style={{ marginTop: 18 }}>{report.exposurePolicy}</p>
            <p className="note">{report.rule}</p>
          </div>
        )}
      </main>
    </>
  );
}
