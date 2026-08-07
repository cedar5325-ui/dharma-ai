export type PublicKnowledgeBaseItem = {
  id: string;
  displayName: string;
  subject: string;
  sourceType: string;
  difficulty: string;
  keywords: string[];
  careerFit: string[];
  policy: string;
  status: string;
  trustNote?: string;
};

export type SourceEvidence = {
  title: string;
  sourceType: string;
  authorsYear: string;
  coreContent: string;
  useInReport: string;
  extractedLength?: number;
};

export type StudentReportInput = {
  studentName?: string;
  grade?: string;
  schoolType?: string;
  targetMajor?: string;
  subject?: string;
  unit?: string;
  interest?: string;
  reportType?: string;
  selectedItems?: PublicKnowledgeBaseItem[];
  topic?: string;
  priorActivity?: string;
  readingSource?: string;
  referenceHint?: string;
  driveEvidence?: SourceEvidence[];
};

export type TrustIndex = {
  curriculumFit: number;
  careerFit: number;
  evidenceFit: number;
  originality: number;
  depth: number;
  total: number;
  comment: string;
};

function safe(value: string | undefined, fallback: string) {
  return value && value.trim() ? value.trim() : fallback;
}

function cleanText(text: string) {
  return String(text || "")
    .replace(/다르마\s*AI/gi, "")
    .replace(/DHARMA\s*AI/gi, "")
    .replace(/Knowledge Base/gi, "제공 자료")
    .replace(/구글\s*드라이브|Google Drive|Drive 링크|고객 화면|공개 메타데이터/gi, "제공 자료")
    .replace(/원본 파일명/g, "자료명")
    .replace(/제공된 제공 자료 자료/g, "제공 자료")
    .replace(/제공 자료 자료/g, "제공 자료")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function clamp(score: number) {
  return Math.max(60, Math.min(98, Math.round(score)));
}

function splitSentences(text: string) {
  return cleanText(text)
    .split(/(?<=[.!?。！？다요함음됨임])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 25);
}

function extractTerms(text: string, inputTerms: string[]) {
  const stop = new Set([
    "그리고", "그러나", "따라서", "이러한", "이것은", "것이다", "수있다", "있다", "한다", "대한", "관련",
    "자료", "내용", "탐구", "보고서", "과정", "중심", "통해", "또한", "위해", "에서", "으로", "하는",
  ]);

  const tokens = cleanText(text)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stop.has(token));

  const counts = new Map<string, number>();

  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  for (const term of inputTerms) {
    if (term && term.trim().length >= 2) {
      counts.set(term.trim(), (counts.get(term.trim()) || 0) + 5);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term)
    .slice(0, 10);
}

function sourceLabel(source: SourceEvidence, index: number) {
  const title = cleanText(source.title || "");
  if (!title || title === "제목 없는 문서") return `제공 자료 ${index + 1}`;
  return `「${title}」`;
}

function sourceSummary(source: SourceEvidence) {
  const content = cleanText(source.coreContent || "");
  if (!content) return "본문에서 충분한 핵심 내용이 추출되지 않았다.";
  return content;
}

function buildEvidenceReview(sources: SourceEvidence[]) {
  return sources
    .map((source, index) => {
      return (
        `${index + 1}) ${sourceLabel(source, index)}\n` +
        `자료 유형: ${cleanText(source.sourceType || "제공 자료")}\n` +
        `본문에서 확인한 핵심 내용: ${sourceSummary(source)}\n` +
        `탐구에서의 활용: ${cleanText(source.useInReport || "해당 자료의 핵심 내용을 탐구 질문과 교과 개념을 연결하는 근거로 활용하였다.")}`
      );
    })
    .join("\n\n");
}

function buildSourceBasedBackground(
  sources: SourceEvidence[],
  subject: string,
  unit: string,
  interest: string,
  major: string,
  priorActivity: string
) {
  const first = sources[0];
  const firstLabel = first ? sourceLabel(first, 0) : "제공 자료";
  const firstSummary = first ? sourceSummary(first) : "제공 자료의 핵심 내용이 충분히 확인되지 않았다.";

  return (
    `${priorActivity}\n\n` +
    `본 탐구는 ${firstLabel}의 본문에서 확인한 내용에서 출발하였다. 이 자료는 ${firstSummary} ` +
    `따라서 본 탐구의 문제의식은 자료 속 내용을 단순히 요약하는 것이 아니라, 그 내용이 ${subject} 과목의 ${unit} 개념과 어떻게 연결되는지 분석하는 데 있다.\n\n` +
    `${interest}는 자료 속에서 하나의 단편적 사례가 아니라 원인, 조건, 과정, 결과가 연결된 문제로 나타난다. 이 점에서 ${unit}은 해당 자료를 해석하는 교과적 기준이 된다. 또한 ${major} 진로와 연결하면, 자료를 읽고 핵심 개념을 추출한 뒤 이를 실제 문제 판단의 기준으로 바꾸는 능력이 중요하다.`
  );
}

function buildCurriculumConnection(sources: SourceEvidence[], subject: string, unit: string, interest: string) {
  const combined = cleanText(sources.map((source) => source.coreContent).join(" "));
  const selectedSentences = splitSentences(combined).slice(0, 6);
  const sentenceText = selectedSentences.length ? selectedSentences.join(" ") : combined.slice(0, 900);

  return (
    `${subject} 과목의 ${unit} 개념은 자료 속 내용을 해석하기 위한 기준으로 활용된다. 제공 자료에서 확인한 핵심 내용은 다음과 같다. ${sentenceText}\n\n` +
    `이 내용을 교과 과정과 연결하면, ${interest}는 단순한 사례가 아니라 ${unit}의 원리와 관련된 탐구 대상이 된다. 즉, 자료는 현상의 배경과 사례를 제시하고, 교과 개념은 그 현상을 설명하거나 판단하는 분석틀을 제공한다. 따라서 본 탐구에서는 자료의 표현을 그대로 옮기는 것이 아니라, 자료 속 핵심 내용을 ${unit} 개념과 연결하여 재구성하였다.`
  );
}

function buildDiscussion(sources: SourceEvidence[], subject: string, unit: string, interest: string, major: string, terms: string[]) {
  const bySource = sources
    .map((source, index) => {
      return `${sourceLabel(source, index)}에서는 ${sourceSummary(source)}`;
    })
    .join("\n\n");

  const question = `${interest}와 관련하여 자료가 제시한 현상은 ${unit} 개념으로 어디까지 설명될 수 있으며, 설명되지 않는 부분은 무엇인가?`;

  return (
    `1. 자료별 핵심 내용 분석\n${bySource}\n\n` +
    `2. 교과 개념과의 연결\n위 자료들을 종합하면 ${interest}는 ${subject} 과목의 ${unit} 개념을 통해 분석할 수 있다. 특히 ${terms.join(", ")}와 같은 키워드는 자료에서 반복적으로 드러나는 핵심 요소이다. 이 키워드들은 단순한 단어 목록이 아니라 자료가 어떤 현상과 문제를 중심으로 구성되어 있는지를 보여 준다.\n\n` +
    `3. 이어진 궁금증\n자료를 읽으면서 이어진 궁금증은 “${question}”이다. 자료는 현상과 사례를 제시하지만, 그 현상이 어떤 조건에서 강화되거나 약화되는지, 그리고 어떤 교과 원리로 더 정교하게 설명될 수 있는지는 추가 분석이 필요하다.\n\n` +
    `4. 새롭게 알게 된 점\n탐구를 통해 새롭게 알게 된 점은 ${unit}이 단순한 교과 용어가 아니라 자료의 내용을 해석하는 실제 분석 기준이라는 것이다. 자료를 읽고 핵심 내용을 추출한 뒤, 그것을 ${major} 진로와 연결하면 단순한 독해가 아니라 전문적 판단의 과정으로 발전할 수 있다.`
  );
}

function nextPlan(grade: string, subject: string, unit: string, interest: string, terms: string[]) {
  if (!(grade.includes("1학년") || grade.includes("2학년"))) return "";

  return (
    `이번 탐구는 현재 학년에서 학습한 ${unit} 개념과 제공 자료의 내용을 바탕으로 하였다. 후속 탐구에서는 다음 학기 또는 다음 학년에 배우는 ${subject} 심화 단원과 연결하여 ${interest}를 더 구체적으로 분석하고자 한다.\n\n` +
    `구체적으로는 첫째, 이번 자료에서 확인한 ${terms.slice(0, 4).join(", ")} 개념을 다음 단원의 핵심 개념과 비교한다. 둘째, 제공 자료에서 충분히 설명되지 않은 조건이나 한계를 찾아 추가 질문으로 설정한다. 셋째, 같은 주제의 다른 제공 자료를 추가로 확보하여 자료 간 공통점과 차이를 비교한다. 넷째, 그 결과를 바탕으로 ${unit} 개념이 실제 문제 분석에서 어떤 설명력을 갖는지 평가한다.`
  );
}

function bookActivity(sources: SourceEvidence[], subject: string, unit: string) {
  const bookLike = sources.find((source) => {
    const joined = `${source.title} ${source.sourceType} ${source.coreContent}`;
    return /도서|독후감|저자|출판|책|읽으며|선정 동기|주요 내용/.test(joined);
  });

  if (!bookLike) {
    return (
      `제공 자료 중 도서활동으로 분류할 수 있는 자료가 확인되지 않았다. 따라서 관련 도서활동은 임의의 도서를 추가하지 않고 생략하였다. ` +
      `학교 제출 전에는 ${subject} 과목의 ${unit} 개념과 직접 연결되는 도서 자료를 제공 자료에 추가한 뒤, 그 도서에서 새롭게 알게 된 점과 비판적 의문을 보완하는 것이 적절하다.`
    );
  }

  return (
    `관련 도서활동은 ${sourceLabel(bookLike, sources.indexOf(bookLike))}를 바탕으로 구성하였다. 이 자료에서 확인한 핵심 내용은 다음과 같다. ${sourceSummary(bookLike)}\n\n` +
    `탐구 내용이 교과 개념과 자료 분석에 집중했다면, 도서활동은 같은 주제를 더 넓은 관점에서 바라보게 한다. 특히 이 도서 자료를 통해 새롭게 알게 된 점은 ${unit}이 단일한 개념으로만 작동하는 것이 아니라, 학생의 사고방식과 문제 인식의 방향까지 확장될 수 있다는 것이다.\n\n` +
    `다만 도서 자료는 설명의 폭이 넓은 대신 특정 교과 개념의 조건, 한계, 자료 검증 과정을 충분히 제시하지 못할 수 있다. 따라서 후속 독서에서는 도서의 관점과 다른 제공 자료의 근거를 비교하여 비판적으로 검토할 필요가 있다.`
  );
}

function trustIndex(sourceCount: number, input: StudentReportInput): TrustIndex {
  const total = clamp(75 + Math.min(sourceCount * 5, 20) + (input.subject ? 2 : 0) + (input.unit ? 3 : 0));
  return {
    curriculumFit: clamp(total),
    careerFit: clamp(total),
    evidenceFit: clamp(total + 5),
    originality: clamp(total - 2),
    depth: clamp(total + 2),
    total,
    comment: "제공 자료의 본문 내용을 중심으로 구성한 보고서입니다.",
  };
}

export function recommendTopics(input: StudentReportInput) {
  const subject = safe(input.subject, "선택 과목");
  const unit = safe(input.unit, "교과 핵심 개념");
  const interest = safe(input.interest, "관심 분야");
  const major = safe(input.targetMajor, "희망 진로");

  return [
    `${unit}의 교과 원리와 ${major} 진로 적용 가능성 분석`,
    `${interest} 문제를 ${subject} 교과 개념으로 해석한 약식 논문`,
    `${unit}과 ${interest}의 관계를 중심으로 한 ${subject} 심화 탐구`,
    `${major} 진로 관점에서 본 ${unit}의 실제 활용과 한계`,
    `제공 자료 본문 분석을 활용한 ${subject} 연구보고서`,
  ];
}

export function generateReport(input: StudentReportInput) {
  const sources = input.driveEvidence || [];

  if (!sources.length) {
    return {
      ok: false,
      title: "",
      message: "입력 과목과 일치하는 제공 자료 본문을 찾지 못했습니다.",
      sections: [],
    };
  }

  const subject = safe(input.subject, "선택 과목");
  const unit = safe(input.unit, "교과 핵심 개념");
  const interest = safe(input.interest, "탐구 주제");
  const major = safe(input.targetMajor, "희망 진로");
  const grade = safe(input.grade, "학년 미입력");
  const studentName = safe(input.studentName, "학생");
  const topic = input.topic || `${unit}의 교과 원리와 ${major} 진로 적용 가능성 분석`;
  const priorActivity = safe(input.priorActivity, `${subject} 수업에서 ${unit} 개념을 학습하며 실제 문제와의 연결성에 관심을 갖게 되었다.`);

  const combined = sources.map((source) => source.coreContent).join(" ");
  const terms = extractTerms(combined, [subject, unit, interest, major]);
  const plan = nextPlan(grade, subject, unit, interest, terms);
  const index = trustIndex(sources.length, input);

  const sections = [
    {
      title: `<${subject}>`,
      content: `${topic}\n${studentName}`,
    },
    {
      title: "초록",
      content:
        `본 연구는 제공 자료의 본문에서 추출한 내용만을 바탕으로 ${subject} 과목의 ${unit} 개념과 ${interest}의 관련성을 분석한 학교 제출용 약식 논문이다. ` +
        `연구는 자료의 제목이 아니라 본문 내용을 우선 검토하여 핵심 내용을 추출하고, 이를 교과 개념과 ${major} 진로의 실제 문제 판단으로 연결하는 방식으로 진행하였다.`,
    },
    {
      title: "Ⅰ. 서론",
      content:
        `1. 연구 배경\n${buildSourceBasedBackground(sources, subject, unit, interest, major, priorActivity)}\n\n` +
        `2. 연구 질문\n본 연구의 질문은 “제공 자료에서 확인되는 ${interest}의 핵심 내용은 ${unit} 개념으로 어떻게 설명되며, 이것이 ${major} 진로 또는 실제 문제 판단과 어떻게 연결되는가?”이다.\n\n` +
        `3. 연구 목적\n본 연구의 목적은 제공 자료의 본문에서 확인한 핵심 내용을 바탕으로 ${unit}의 교과적 의미를 분석하고, 이를 ${interest}와 ${major} 진로의 실제 문제로 연결하는 데 있다.`,
    },
    {
      title: "Ⅱ. 제공 자료 검토",
      content:
        `1. 사용한 제공 자료\n${sources.map((source, index) => `${index + 1}) ${sourceLabel(source, index)}`).join("\n")}\n\n` +
        `2. 자료별 본문 핵심 내용\n${buildEvidenceReview(sources)}\n\n` +
        `3. 핵심 키워드\n제공 자료의 본문에서 추출한 주요 키워드는 ${terms.join(", ")}이다. 이 키워드는 보고서의 분석 방향을 설정하는 기준으로 활용하였다.`,
    },
    {
      title: "Ⅲ. 교과과정 연계 분석",
      content: buildCurriculumConnection(sources, subject, unit, interest),
    },
    {
      title: "Ⅳ. 분석 및 논의",
      content: buildDiscussion(sources, subject, unit, interest, major, terms),
    },
    ...(plan ? [{ title: "Ⅴ. 추가탐구 계획", content: plan }] : []),
    {
      title: plan ? "Ⅵ. 관련 도서활동" : "Ⅴ. 관련 도서활동",
      content: bookActivity(sources, subject, unit),
    },
    {
      title: plan ? "Ⅶ. 결론 및 느낀 점" : "Ⅵ. 결론 및 느낀 점",
      content:
        `본 탐구를 통해 ${subject}에서 배운 ${unit} 개념은 단순한 교과 지식이 아니라 제공 자료의 내용을 해석하는 기준이 될 수 있음을 확인하였다. ` +
        `특히 자료의 제목보다 본문 내용을 직접 검토하는 과정에서, 같은 주제라도 자료 속 문장과 사례가 어떤 개념을 중심으로 구성되어 있는지 파악하는 것이 중요하다는 점을 알게 되었다.\n\n` +
        `${major} 진로와 연결해 보면, 필요한 역량은 단순히 자료를 많이 모으는 것이 아니라 자료 본문에서 핵심 내용을 추출하고, 이를 교과 개념과 실제 문제 판단으로 연결하는 능력이다. 이번 탐구는 ${interest}를 ${unit}의 관점에서 분석함으로써, 교과 학습이 실제 진로 탐색과 연결될 수 있음을 보여 주었다.`,
    },
    {
      title: "참고자료",
      content: sources.map((source, index) => `${index + 1}) ${sourceLabel(source, index)}`).join("\n"),
    },
  ];

  return {
    ok: true,
    title: cleanText(topic),
    meta: {
      studentName,
      grade,
      schoolType: input.schoolType || "학교 유형 미입력",
      targetMajor: major,
      subject,
      unit,
      reportType: input.reportType || "제공 자료 본문 기반 학교 제출용 약식 논문",
      generatedAt: new Date().toISOString(),
      sourcePolicy: "제공 자료 본문만 사용",
      sourceCount: sources.length,
    },
    trustIndex: index,
    selectedPublicSources: sources.map((source, index) => ({
      id: `drive-source-${index + 1}`,
      displayName: sourceLabel(source, index),
      subject,
      sourceType: source.sourceType,
      difficulty: "본문 기반 자료",
      policy: "제공 자료 본문만 사용",
    })),
    sections: sections.map((section) => ({
      title: cleanText(section.title),
      content: cleanText(section.content),
    })),
    exposurePolicy: "보고서는 제공 자료 본문에서 추출한 내용만 바탕으로 생성됩니다.",
    rule: "문서 제목이 아니라 본문 내용을 우선 검토하여 보고서를 구성합니다.",
  };
}

export function reportToPlainText(report: any) {
  if (!report.ok) return report.message || "";
  return report.sections.flatMap((section: any) => [section.title, section.content, ""]).join("\n");
}
