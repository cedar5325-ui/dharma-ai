export type DriveFileLike = {
  id: string;
  name: string;
  mimeType?: string | null;
  modifiedTime?: string | null;
  webViewLink?: string | null;
};

export type InternalKnowledgeBaseItem = DriveFileLike & {
  originalName: string;
  safeId: string;
  displayName: string;
  subject: string;
  sourceType: string;
  difficulty: string;
  keywords: string[];
  careerFit: string[];
  status: string;
  policy: string;
  trustNote: string;
};

export type PublicKnowledgeBaseItem = {
  id: string;
  displayName: string;
  subject: string;
  sourceType: string;
  difficulty: string;
  keywords: string[];
  careerFit: string[];
  status: string;
  policy: string;
  trustNote: string;
};

const excludedFileKeywords = ["러셀광주근태관리"];

const subjectRules: Array<[string, string[]]> = [
  ["생명과학", ["생명", "면역", "dna", "유전자", "세포", "바이오", "단백질", "효소", "질병", "약물전달", "의학", "감염"]],
  ["화학", ["화학", "반응", "촉매", "분자", "원소", "산화", "환원", "반도체", "소재", "고분자", "전해질"]],
  ["물리", ["물리", "역학", "전자기", "양자", "파동", "에너지", "전류", "반도체", "광학", "힘"]],
  ["수학", ["수학", "함수", "통계", "확률", "미분", "적분", "모델", "모델링", "데이터", "회귀", "그래프"]],
  ["지구과학", ["지구", "기후", "대기", "해양", "지질", "화산", "지진", "천문", "환경"]],
  ["정보", ["ai", "인공지능", "알고리즘", "코딩", "프로그래밍", "머신러닝", "딥러닝", "데이터베이스"]],
  ["사회", ["사회", "경제", "정책", "법", "윤리", "교육", "심리", "복지"]],
  ["국어", ["국어", "문학", "독서", "작품", "비평", "글쓰기"]],
  ["영어", ["영어", "english", "translation", "영문", "번역"]],
];

const keywordBank = [
  "면역", "약물전달", "유전자", "세포", "질병", "반도체", "반응속도", "촉매", "소재",
  "기후", "모델링", "통계", "데이터", "AI", "인공지능", "윤리", "교육과정", "진로연계",
  "탐구보고서", "논문", "학생부", "독서", "실험", "분석"
];

function normalize(name: string) {
  return name.toLowerCase().replace(/[\-_()[\]{}.,]/g, " ");
}

export function shouldExcludeDriveFile(file: DriveFileLike) {
  const normalized = normalize(file.name);
  return excludedFileKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function inferSourceType(file: DriveFileLike) {
  const name = file.name.toLowerCase();
  const mime = file.mimeType || "";

  if (name.endsWith(".pdf") || mime.includes("pdf")) return "PDF";
  if (name.endsWith(".docx") || mime.includes("document")) return "문서";
  if (name.endsWith(".xlsx") || name.endsWith(".csv") || mime.includes("spreadsheet")) return "데이터";
  if (name.endsWith(".pptx") || mime.includes("presentation")) return "슬라이드";
  if (name.includes("논문") || name.includes("paper") || name.includes("journal")) return "논문";
  if (name.includes("보고서")) return "보고서";
  if (name.includes("도서") || name.includes("book")) return "도서";
  return "자료";
}

export function getSafeDisplayName(file: DriveFileLike, index: number) {
  const sourceType = inferSourceType(file);
  return `검증 자료 ${index + 1} · ${sourceType}`;
}

export function inferSubject(name: string) {
  const normalized = normalize(name);
  for (const [subject, words] of subjectRules) {
    if (words.some((word) => normalized.includes(word.toLowerCase()))) {
      return subject;
    }
  }
  return "미분류";
}

export function inferDifficulty(name: string, sourceType: string) {
  const normalized = normalize(name);
  if (normalized.includes("심화") || normalized.includes("advanced") || normalized.includes("논문") || sourceType === "논문") return "심화";
  if (normalized.includes("기초") || normalized.includes("basic") || normalized.includes("개념")) return "기초";
  if (normalized.includes("실험") || normalized.includes("분석") || sourceType === "데이터") return "중상";
  return "중";
}

export function inferKeywords(name: string) {
  const normalized = normalize(name);
  const found = keywordBank.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  return Array.from(new Set(found)).slice(0, 8);
}

export function inferCareerFit(subject: string, keywords: string[]) {
  const pool = keywords.join(" ");
  if (subject === "생명과학" || /의학|질병|면역|약물|세포|유전자/.test(pool)) return ["의예과", "약학과", "생명공학"];
  if (subject === "화학" || /반도체|소재|촉매|반응/.test(pool)) return ["화학공학", "신소재공학", "반도체공학"];
  if (subject === "수학" || /데이터|통계|모델/.test(pool)) return ["데이터사이언스", "통계학", "산업공학"];
  if (subject === "물리") return ["물리학", "전자공학", "기계공학"];
  if (subject === "정보") return ["컴퓨터공학", "AI융합", "데이터사이언스"];
  if (subject === "지구과학") return ["환경공학", "지구과학", "기후과학"];
  return ["진로 탐색"];
}

export function classifyKnowledgeBaseItem(file: DriveFileLike, index: number): InternalKnowledgeBaseItem {
  const subject = inferSubject(file.name);
  const sourceType = inferSourceType(file);
  const difficulty = inferDifficulty(file.name, sourceType);
  const keywords = inferKeywords(file.name);
  const careerFit = inferCareerFit(subject, keywords);

  return {
    ...file,
    originalName: file.name,
    safeId: `kb-${index + 1}`,
    displayName: getSafeDisplayName(file, index),
    subject,
    sourceType,
    difficulty,
    keywords,
    careerFit,
    status: "색인 완료",
    policy: "원자료 내용 비공개 · 분석 후 재구성",
    trustNote: "고객 화면에는 원본 파일명, 원문 내용, Drive 링크를 표시하지 않습니다.",
  };
}

export function toPublicKnowledgeBaseItem(item: InternalKnowledgeBaseItem): PublicKnowledgeBaseItem {
  return {
    id: item.safeId,
    displayName: item.displayName,
    subject: item.subject,
    sourceType: item.sourceType,
    difficulty: item.difficulty,
    keywords: item.keywords,
    careerFit: item.careerFit,
    status: item.status,
    policy: item.policy,
    trustNote: item.trustNote,
  };
}

export function filterAndClassifyKnowledgeBase(files: DriveFileLike[]) {
  return files
    .filter((file) => !shouldExcludeDriveFile(file))
    .map((file, index) => classifyKnowledgeBaseItem(file, index));
}

export function toPublicKnowledgeBase(items: InternalKnowledgeBaseItem[]) {
  return items.map(toPublicKnowledgeBaseItem);
}

export function summarizeKnowledgeBase(items: PublicKnowledgeBaseItem[]) {
  const subjects = new Set(items.map((item) => item.subject));
  const sourceTypes = new Set(items.map((item) => item.sourceType));
  const advanced = items.filter((item) => item.difficulty === "심화").length;

  return {
    total: items.length,
    subjects: subjects.size,
    sourceTypes: sourceTypes.size,
    advanced,
  };
}
