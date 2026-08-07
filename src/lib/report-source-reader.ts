import { listDriveFilesWithAccessToken } from "@/lib/google-drive-oauth";

export type SourceEvidence = {
  title: string;
  sourceType: "구글드라이브 자료" | "논문" | "공공기관 자료" | "칼럼" | "도서" | "보고서" | "기타";
  authorsYear: string;
  coreContent: string;
  useInReport: string;
  extractedLength: number;
  inferredSubject?: string;
  inferredUnit?: string;
  inferredTopic?: string;
  inferredKeywords?: string[];
  subjectScore?: number;
};

export type DriveReadDiagnostics = {
  totalFilesListed: number;
  candidateFiles: number;
  googleDocsCount: number;
  convertedDocsCount: number;
  textLikeCount: number;
  attemptedReadCount: number;
  extractedCount: number;
  skippedNoTextCount: number;
  skippedUnsupportedCount: number;
  readableBeforeSubjectFilter: number;
  rejectedBySubjectCount: number;
  subjectProfile: string;
  sampleCandidates: string[];
  sampleUnsupported: string[];
  sampleRejectedBySubject: string[];
  message: string;
};

type InputLike = {
  subject?: string;
  unit?: string;
  interest?: string;
  targetMajor?: string;
  topic?: string;
};

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";
const GOOGLE_PRESENTATION_MIME = "application/vnd.google-apps.presentation";
const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";

type SubjectRule = {
  key: string;
  units: string[];
  include: string[];
  exclude: string[];
};

const SUBJECT_RULES: SubjectRule[] = [
  {
    key: "생명과학",
    units: ["생명 시스템", "세포와 물질대사", "유전 정보의 발현", "항상성과 몸의 조절", "면역", "생명공학 기술", "막전위와 활동전위", "신경세포와 시냅스", "알츠하이머와 신경퇴행"],
    include: ["생명", "생명과학", "고급생명", "고급생명과학", "바이오", "세포", "세포막", "유전자", "dna", "rna", "단백질", "효소", "면역", "항체", "백신", "항생제", "내성", "플라스미드", "세균", "감염", "질병", "생명공학", "신경", "신경계", "신경세포", "뉴런", "축삭", "수상돌기", "시냅스", "신경전달물질", "아세틸콜린", "도파민", "막전위", "활동전위", "휴지막전위", "탈분극", "재분극", "나트륨", "칼륨", "나트륨 통로", "칼륨 통로", "이온 통로", "전위차", "뇌", "인지", "기억", "학습", "치매", "알츠하이머", "아밀로이드", "베타 아밀로이드", "타우", "타우 단백질", "신경퇴행", "퇴행성", "뇌세포", "중추신경계", "말초신경계", "호르몬", "항상성"],
    exclude: ["윤리와사상", "철학", "칸트", "롤스", "공리주의", "탁월한 사유", "독후감", "고급화학", "화학평형"],
  },
  {
    key: "화학",
    units: ["물질의 구조", "화학 결합", "산과 염기", "중화 반응", "산화와 환원", "화학 평형", "반응 속도", "전기화학", "완충 용액"],
    include: ["화학", "고급화학", "ph", "pH", "산성", "염기", "산염기", "중화", "완충", "반응속도", "반응 속도", "화학평형", "화학 평형", "산화", "환원", "촉매", "전기화학", "몰", "농도", "용액", "이온", "수소 이온", "해양 산성화", "토양 산도", "전해질", "결합", "분자", "원자", "반응식"],
    exclude: ["윤리와사상", "철학", "칸트", "롤스", "알츠하이머", "막전위", "플라스미드"],
  },
  {
    key: "윤리와사상",
    units: ["인간과 윤리", "동양 윤리", "서양 윤리", "의무론", "공리주의", "덕 윤리", "사회사상", "롤스의 정의론", "과학기술 윤리", "생명윤리"],
    include: ["윤리와사상", "윤리와 사상", "생활과 윤리", "철학", "칸트", "롤스", "공리주의", "아리스토텔레스", "정의", "공정", "인권", "인간 존엄", "사유", "자유", "덕 윤리", "의무론", "생명윤리", "ai 윤리", "기술윤리"],
    exclude: ["고급화학", "화학평형", "플라스미드", "막전위", "알츠하이머"],
  },
  {
    key: "사회문제탐구",
    units: ["사회현상 분석", "자료 조사", "사회 불평등", "인권과 정의", "정책 분석", "지역문제", "노동 문제", "주거 문제", "청년 문제", "기술과 사회"],
    include: ["사회", "사회문제", "사회현상", "통합사회", "사회문화", "정치와법", "경제", "인권", "불평등", "지역소멸", "정책", "복지", "노동", "청년", "주거", "고령화", "저출산", "플랫폼", "상권", "지역", "제도"],
    exclude: ["고급화학", "ph", "플라스미드", "막전위"],
  },
  {
    key: "국어",
    units: ["문학 감상", "비판적 읽기", "매체 언어", "화법과 작문", "담화와 문법", "고전 읽기"],
    include: ["국어", "문학", "독서", "언어와 매체", "화법", "작문", "시", "소설", "비평", "서술자", "화자", "상징", "문체"],
    exclude: ["고급화학", "ph", "플라스미드", "막전위"],
  },
  {
    key: "영어",
    units: ["주장과 근거", "어휘와 구문", "담화 구조", "문화 이해", "영어 독해", "영어 작문"],
    include: ["영어", "english", "영어독해", "영어 독해", "영어작문", "영어 작문", "진로영어", "번역", "영문", "영미", "paragraph", "essay"],
    exclude: ["고급화학", "ph", "플라스미드", "막전위"],
  },
  {
    key: "수학",
    units: ["함수", "수열", "미분", "적분", "확률", "통계", "기하", "벡터", "수학적 모델링"],
    include: ["수학", "고급수학", "함수", "수열", "미분", "적분", "확률", "통계", "기하", "벡터", "행렬", "모델링", "회귀", "그래프", "경제수학"],
    exclude: ["윤리와사상", "독후감", "플라스미드", "막전위"],
  },
  {
    key: "물리",
    units: ["힘과 운동", "에너지", "열역학", "전자기", "파동", "현대 물리", "반도체", "양자"],
    include: ["물리", "고급물리", "역학", "운동", "에너지", "전기", "자기", "파동", "전자기", "양자", "반도체", "힘", "속도", "가속도", "운동량"],
    exclude: ["윤리와사상", "독후감", "ph", "알츠하이머"],
  },
  {
    key: "지구과학",
    units: ["지구 시스템", "대기와 해양", "기후 변화", "지질", "천문", "해양 순환", "재난"],
    include: ["지구과학", "지구", "기후", "대기", "해양", "지질", "천문", "환경", "해수면", "지진", "화산", "암석", "기상", "태풍"],
    exclude: ["윤리와사상", "고급화학", "플라스미드", "막전위"],
  },
  {
    key: "정보",
    units: ["자료 표현", "알고리즘", "프로그래밍", "데이터 분석", "인공지능", "정보 윤리", "보안"],
    include: ["정보", "인공지능", "ai", "알고리즘", "데이터", "프로그래밍", "코딩", "머신러닝", "딥러닝", "컴퓨터", "소프트웨어", "보안"],
    exclude: ["고급화학", "ph", "플라스미드", "막전위"],
  },
];

function normalize(text: string) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ");
}

function cleanText(text: string) {
  return String(text || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inputTerms(input: InputLike) {
  return [input.subject, input.unit, input.interest, input.targetMajor, input.topic]
    .filter(Boolean)
    .flatMap((v) => String(v).split(/[\s,·/()_\\-]+/))
    .map((v) => v.trim())
    .filter((v) => v.length >= 2)
    .slice(0, 30);
}

function requestedRule(input: InputLike) {
  const text = normalize(`${input.subject || ""} ${input.unit || ""} ${input.interest || ""} ${input.topic || ""}`);
  let best = SUBJECT_RULES[0];
  let score = -9999;

  for (const rule of SUBJECT_RULES) {
    let current = 0;
    for (const term of rule.include) if (text.includes(normalize(term))) current += 5;
    for (const term of rule.exclude) if (text.includes(normalize(term))) current -= 3;

    if (current > score) {
      best = rule;
      score = current;
    }
  }

  return best;
}

function classifyText(text: string, input: InputLike) {
  const body = normalize(text.slice(0, 30000));
  const requested = requestedRule(input);
  const inputKeys = inputTerms(input);

  const scores = SUBJECT_RULES.map((rule) => {
    let score = 0;

    for (const term of rule.include) if (body.includes(normalize(term))) score += 8;
    for (const term of inputKeys) if (body.includes(normalize(term))) score += 6;
    for (const term of rule.exclude) if (body.includes(normalize(term))) score -= 10;
    if (rule.key === requested.key) score += 5;

    return { rule, score };
  }).sort((a, b) => b.score - a.score);

  const best = scores[0];
  const requestedScore = scores.find((item) => item.rule.key === requested.key)?.score || 0;

  return { requested, bestRule: best.rule, bestScore: best.score, requestedScore };
}

function inferUnit(rule: SubjectRule, text: string, input: InputLike) {
  const body = normalize(text);
  const direct = input.unit?.trim();

  if (direct && direct.length >= 2 && body.includes(normalize(direct))) return direct;

  let bestUnit = rule.units[0] || "교과 핵심 개념";
  let bestScore = -1;

  for (const unit of rule.units) {
    let score = 0;

    for (const token of unit.split(/[\s·,]+/)) {
      if (token.length >= 2 && body.includes(normalize(token))) score += 1;
    }

    if (score > bestScore) {
      bestUnit = unit;
      bestScore = score;
    }
  }

  return bestUnit;
}

function extractKeywords(text: string, input: InputLike, rule: SubjectRule) {
  const stopWords = new Set(["그리고", "그러나", "따라서", "이러한", "것이다", "한다", "있다", "대한", "관련", "자료", "내용", "탐구", "보고서", "과정", "중심", "통해", "에서", "으로", "하는"]);
  const counts = new Map<string, number>();
  const body = cleanText(text);

  for (const token of body.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/)) {
    const trimmed = token.trim();
    if (trimmed.length >= 2 && !stopWords.has(trimmed)) {
      counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
    }
  }

  for (const term of inputTerms(input)) {
    counts.set(term, (counts.get(term) || 0) + 8);
  }

  for (const term of rule.include) {
    if (normalize(body).includes(normalize(term))) {
      counts.set(term, (counts.get(term) || 0) + 5);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term)
    .slice(0, 12);
}

function inferTopic(text: string, input: InputLike, rule: SubjectRule, unit: string, keywords: string[]) {
  if (input.topic && input.topic.trim()) return input.topic.trim();

  if (input.interest && input.interest.trim()) {
    return `${unit}과 ${input.interest.trim()}의 관계를 중심으로 한 ${rule.key} 탐구`;
  }

  return `${unit}과 ${keywords.slice(0, 3).join(", ")}의 관계를 중심으로 한 ${rule.key} 탐구`;
}

function titleFromText(text: string, fallback: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter((line) => line.length >= 4 && line.length <= 160);

  return lines[0] || fallback;
}

function splitSentences(text: string) {
  return cleanText(text)
    .split(/(?<=[.!?。！？다요함음됨임])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 35);
}

function relevantSummary(text: string, input: InputLike, keywords: string[]) {
  const keys = [...inputTerms(input), ...keywords].slice(0, 30);
  const sentences = splitSentences(text);

  const selected = sentences
    .map((sentence) => ({
      sentence,
      score: keys.reduce((sum, key) => sum + (sentence.toLowerCase().includes(key.toLowerCase()) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.sentence)
    .slice(0, 8);

  return (selected.length ? selected : sentences.slice(0, 7)).join(" ");
}

function sourceType(name: string, text: string): SourceEvidence["sourceType"] {
  const joined = `${name} ${text.slice(0, 800)}`.toLowerCase();

  if (joined.includes("논문") || joined.includes("journal") || joined.includes("abstract") || joined.includes("research")) return "논문";
  if (joined.includes("공공") || joined.includes("교육부") || joined.includes("질병관리") || joined.includes("국립") || joined.includes("환경부") || joined.includes("통계청") || joined.includes("연보")) return "공공기관 자료";
  if (joined.includes("칼럼") || joined.includes("기고") || joined.includes("오피니언") || joined.includes("column")) return "칼럼";
  if (joined.includes("도서") || joined.includes("책") || joined.includes("저자") || joined.includes("출판")) return "도서";
  if (joined.includes("보고서")) return "보고서";
  return "구글드라이브 자료";
}

function isTextFile(file: any) {
  const mime = String(file.mimeType || "");
  const name = String(file.name || "").toLowerCase();
  return mime.startsWith("text/") || mime.includes("csv") || Boolean(name.match(/\.(txt|md|csv|html|htm)$/));
}

function isReadable(file: any) {
  const mime = String(file.mimeType || "");
  const name = String(file.name || "").toLowerCase();

  if (name.includes("러셀광주근태관리")) return false;
  if (mime === GOOGLE_FOLDER_MIME) return false;

  return mime === GOOGLE_DOC_MIME || mime === GOOGLE_SHEET_MIME || mime === GOOGLE_PRESENTATION_MIME || isTextFile(file);
}

async function fetchFileText(accessToken: string, file: any) {
  const id = file.id;
  const mime = String(file.mimeType || "");

  try {
    if (mime === GOOGLE_DOC_MIME) {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      return response.ok ? await response.text() : "";
    }

    if (mime === GOOGLE_SHEET_MIME) {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/csv`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      return response.ok ? await response.text() : "";
    }

    if (mime === GOOGLE_PRESENTATION_MIME) {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/plain`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      return response.ok ? await response.text() : "";
    }

    if (isTextFile(file)) {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      return response.ok ? await response.text() : "";
    }

    return "";
  } catch {
    return "";
  }
}

function priority(file: any, input: InputLike) {
  const mime = String(file.mimeType || "");
  const name = normalize(String(file.name || ""));
  let score = 0;

  if (mime === GOOGLE_DOC_MIME) score += 100;
  if (String(file.name || "").includes("(Google Docs 변환본)")) score += 50;
  if (mime === GOOGLE_SHEET_MIME || mime === GOOGLE_PRESENTATION_MIME) score += 20;
  if (isTextFile(file)) score += 20;

  for (const key of inputTerms(input)) {
    if (name.includes(normalize(key))) score += 10;
  }

  return score;
}

export async function readGoogleDriveEvidenceWithDiagnostics(
  accessToken: string | undefined,
  input: InputLike
): Promise<{ evidence: SourceEvidence[]; diagnostics: DriveReadDiagnostics }> {
  const requested = requestedRule(input);

  const diagnostics: DriveReadDiagnostics = {
    totalFilesListed: 0,
    candidateFiles: 0,
    googleDocsCount: 0,
    convertedDocsCount: 0,
    textLikeCount: 0,
    attemptedReadCount: 0,
    extractedCount: 0,
    skippedNoTextCount: 0,
    skippedUnsupportedCount: 0,
    readableBeforeSubjectFilter: 0,
    rejectedBySubjectCount: 0,
    subjectProfile: requested.key,
    sampleCandidates: [],
    sampleUnsupported: [],
    sampleRejectedBySubject: [],
    message: "Google Drive 연결이 없습니다.",
  };

  if (!accessToken) return { evidence: [], diagnostics };

  const files = await listDriveFilesWithAccessToken(accessToken);
  diagnostics.totalFilesListed = files.length;
  diagnostics.googleDocsCount = files.filter((file: any) => file.mimeType === GOOGLE_DOC_MIME).length;
  diagnostics.convertedDocsCount = files.filter((file: any) => String(file.name || "").includes("(Google Docs 변환본)")).length;
  diagnostics.textLikeCount = files.filter(isTextFile).length;

  const readable = files
    .filter(isReadable)
    .sort((a: any, b: any) => priority(b, input) - priority(a, input));

  diagnostics.readableBeforeSubjectFilter = readable.length;
  diagnostics.skippedUnsupportedCount = files.length - readable.length;
  diagnostics.sampleUnsupported = files
    .filter((file: any) => !isReadable(file))
    .slice(0, 12)
    .map((file: any) => `${file.name} / ${file.mimeType || "unknown"}`);

  const matched: Array<{
    file: any;
    text: string;
    inferredSubject: string;
    inferredUnit: string;
    inferredTopic: string;
    inferredKeywords: string[];
    score: number;
  }> = [];

  const rejected: string[] = [];

  for (const file of readable.slice(0, 700)) {
    const raw = await fetchFileText(accessToken, file);
    const text = cleanText(raw);

    if (text.length < 120) {
      diagnostics.skippedNoTextCount += 1;
      continue;
    }

    const classification = classifyText(text, input);
    const accepted = classification.bestRule.key === requested.key || classification.requestedScore > 0;

    if (!accepted) {
      rejected.push(`${file.name} / 본문 자동분류=${classification.bestRule.key}, 요청과목=${requested.key}, best=${classification.bestScore}, requested=${classification.requestedScore}`);
      continue;
    }

    const rule = classification.bestRule.key === requested.key ? classification.bestRule : requested;
    const inferredUnit = inferUnit(rule, text, input);
    const inferredKeywords = extractKeywords(text, input, rule);
    const inferredTopic = inferTopic(text, input, rule, inferredUnit, inferredKeywords);

    matched.push({
      file,
      text,
      inferredSubject: rule.key,
      inferredUnit,
      inferredTopic,
      inferredKeywords,
      score: Math.max(classification.bestScore, classification.requestedScore),
    });
  }

  matched.sort((a, b) => b.score - a.score);

  diagnostics.rejectedBySubjectCount = rejected.length;
  diagnostics.candidateFiles = matched.length;
  diagnostics.sampleRejectedBySubject = rejected.slice(0, 12);
  diagnostics.sampleCandidates = matched
    .slice(0, 12)
    .map((item) => `${item.file.name} / 자동분류=${item.inferredSubject} / 단원=${item.inferredUnit} / score=${item.score} / 핵심어=${item.inferredKeywords.slice(0, 5).join(", ")}`);

  const evidence: SourceEvidence[] = [];

  for (const item of matched.slice(0, 16)) {
    if (evidence.length >= 12) break;

    diagnostics.attemptedReadCount += 1;

    const title = titleFromText(item.text, String(item.file.name || "제공 자료"));
    const coreContent = relevantSummary(item.text, input, item.inferredKeywords);

    if (coreContent.length < 80) {
      diagnostics.skippedNoTextCount += 1;
      continue;
    }

    evidence.push({
      title,
      sourceType: sourceType(String(item.file.name || ""), item.text),
      authorsYear: title,
      coreContent,
      useInReport: "본문을 자동 분석하여 과목·단원·주제·핵심어를 추출하고, 이를 교과 개념과 탐구 질문에 연결하는 근거로 활용하였다.",
      extractedLength: item.text.length,
      inferredSubject: item.inferredSubject,
      inferredUnit: item.inferredUnit,
      inferredTopic: item.inferredTopic,
      inferredKeywords: item.inferredKeywords,
      subjectScore: item.score,
    });
  }

  diagnostics.extractedCount = evidence.length;

  if (evidence.length > 0) {
    diagnostics.message = `${requested.key} 관련 Google Drive 자료 ${evidence.length}개에서 본문을 읽고 과목·단원·주제·핵심어를 자동 추출했습니다.`;
  } else if (readable.length === 0) {
    diagnostics.message = "Google Docs 또는 텍스트 기반 자료가 없습니다.";
  } else if (matched.length === 0) {
    diagnostics.message = `${requested.key} 과목과 일치하는 본문 내용을 가진 Google Docs 자료가 없습니다. 본문 자동분류 결과를 확인해 주세요.`;
  } else {
    diagnostics.message = `${requested.key} 관련 후보는 있으나 본문 추출에 실패했습니다.`;
  }

  return { evidence, diagnostics };
}

export async function readGoogleDriveEvidence(
  accessToken: string | undefined,
  input: InputLike
): Promise<SourceEvidence[]> {
  const result = await readGoogleDriveEvidenceWithDiagnostics(accessToken, input);
  return result.evidence;
}
