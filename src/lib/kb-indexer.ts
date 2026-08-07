import fs from "fs/promises";
import path from "path";
import { listDriveFilesWithAccessToken, type GoogleDriveFile } from "@/lib/google-drive-oauth";

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";
const GOOGLE_PRESENTATION_MIME = "application/vnd.google-apps.presentation";
const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";
const INDEX_VERSION = "dharma-kb-index-v1";
const CHUNK_SIZE = 1800;
const CHUNK_OVERLAP = 240;
const FETCH_TIMEOUT_MS = 10000;

type SubjectRule = { key: string; units: string[]; include: string[]; exclude: string[] };

export type KBIndexItem = {
  id: string;
  fileId: string;
  fileName: string;
  title: string;
  mimeType: string;
  modifiedTime?: string | null;
  webViewLink?: string | null;
  subject: string;
  unit: string;
  topic: string;
  keywords: string[];
  summary: string;
  extractedLength: number;
  chunkCount: number;
  indexedAt: string;
};

export type KBIndexChunk = {
  id: string;
  itemId: string;
  fileId: string;
  fileName: string;
  title: string;
  subject: string;
  unit: string;
  topic: string;
  keywords: string[];
  chunkIndex: number;
  text: string;
};

export type KnowledgeBaseIndex = {
  version: string;
  indexedAt: string;
  totalFilesListed: number;
  totalReadableFiles: number;
  indexedFiles: number;
  totalChunks: number;
  items: KBIndexItem[];
  chunks: KBIndexChunk[];
  errors: string[];
};

export type SearchInput = {
  subject?: string;
  unit?: string;
  interest?: string;
  targetMajor?: string;
  topic?: string;
  query?: string;
  limit?: number;
};

const RULES: SubjectRule[] = [
  { key: "생명과학", units: ["생명 시스템", "세포와 물질대사", "유전 정보의 발현", "항상성과 몸의 조절", "면역", "생명공학 기술", "막전위와 활동전위", "신경세포와 시냅스", "알츠하이머와 신경퇴행"], include: ["생명", "생명과학", "고급생명", "고급생명과학", "바이오", "세포", "세포막", "유전자", "dna", "rna", "단백질", "효소", "면역", "항체", "백신", "항생제", "내성", "플라스미드", "세균", "감염", "질병", "생명공학", "신경", "신경계", "신경세포", "뉴런", "축삭", "수상돌기", "시냅스", "신경전달물질", "아세틸콜린", "도파민", "막전위", "활동전위", "휴지막전위", "탈분극", "재분극", "나트륨", "칼륨", "이온 통로", "전위차", "뇌", "인지", "기억", "학습", "치매", "알츠하이머", "아밀로이드", "베타 아밀로이드", "타우", "타우 단백질", "신경퇴행", "퇴행성", "뇌세포", "중추신경계", "말초신경계", "호르몬", "항상성"], exclude: ["윤리와사상", "철학", "칸트", "롤스", "공리주의", "탁월한 사유", "독후감", "고급화학", "화학평형"] },
  { key: "화학", units: ["물질의 구조", "화학 결합", "산과 염기", "중화 반응", "산화와 환원", "화학 평형", "반응 속도", "전기화학", "완충 용액"], include: ["화학", "고급화학", "ph", "pH", "산성", "염기", "산염기", "중화", "완충", "반응속도", "반응 속도", "화학평형", "화학 평형", "산화", "환원", "촉매", "전기화학", "몰", "농도", "용액", "이온", "수소 이온", "해양 산성화", "토양 산도", "전해질", "결합", "분자", "원자", "반응식"], exclude: ["윤리와사상", "철학", "칸트", "롤스", "알츠하이머", "막전위", "플라스미드"] },
  { key: "윤리와사상", units: ["인간과 윤리", "동양 윤리", "서양 윤리", "의무론", "공리주의", "덕 윤리", "사회사상", "롤스의 정의론", "과학기술 윤리", "생명윤리"], include: ["윤리와사상", "윤리와 사상", "생활과 윤리", "철학", "칸트", "롤스", "공리주의", "아리스토텔레스", "정의", "공정", "인권", "인간 존엄", "사유", "자유", "덕 윤리", "의무론", "생명윤리", "ai 윤리", "기술윤리"], exclude: ["고급화학", "화학평형", "플라스미드", "막전위", "알츠하이머"] },
  { key: "사회문제탐구", units: ["사회현상 분석", "자료 조사", "사회 불평등", "인권과 정의", "정책 분석", "지역문제", "노동 문제", "주거 문제", "청년 문제", "기술과 사회"], include: ["사회", "사회문제", "사회현상", "통합사회", "사회문화", "정치와법", "경제", "인권", "불평등", "지역소멸", "정책", "복지", "노동", "청년", "주거", "고령화", "저출산", "플랫폼", "상권", "지역", "제도"], exclude: ["고급화학", "ph", "플라스미드", "막전위"] },
  { key: "국어", units: ["문학 감상", "비판적 읽기", "매체 언어", "화법과 작문", "담화와 문법", "고전 읽기"], include: ["국어", "문학", "독서", "언어와 매체", "화법", "작문", "시", "소설", "비평", "서술자", "화자", "상징", "문체"], exclude: ["고급화학", "ph", "플라스미드", "막전위"] },
  { key: "영어", units: ["주장과 근거", "어휘와 구문", "담화 구조", "문화 이해", "영어 독해", "영어 작문"], include: ["영어", "english", "영어독해", "영어 독해", "영어작문", "영어 작문", "진로영어", "번역", "영문", "영미", "paragraph", "essay"], exclude: ["고급화학", "ph", "플라스미드", "막전위"] },
  { key: "수학", units: ["함수", "수열", "미분", "적분", "확률", "통계", "기하", "벡터", "수학적 모델링"], include: ["수학", "고급수학", "함수", "수열", "미분", "적분", "확률", "통계", "기하", "벡터", "행렬", "모델링", "회귀", "그래프", "경제수학"], exclude: ["윤리와사상", "독후감", "플라스미드", "막전위"] },
  { key: "물리", units: ["힘과 운동", "에너지", "열역학", "전자기", "파동", "현대 물리", "반도체", "양자"], include: ["물리", "고급물리", "역학", "운동", "에너지", "전기", "자기", "파동", "전자기", "양자", "반도체", "힘", "속도", "가속도", "운동량"], exclude: ["윤리와사상", "독후감", "ph", "알츠하이머"] },
  { key: "지구과학", units: ["지구 시스템", "대기와 해양", "기후 변화", "지질", "천문", "해양 순환", "재난"], include: ["지구과학", "지구", "기후", "대기", "해양", "지질", "천문", "환경", "해수면", "지진", "화산", "암석", "기상", "태풍"], exclude: ["윤리와사상", "고급화학", "플라스미드", "막전위"] },
  { key: "정보", units: ["자료 표현", "알고리즘", "프로그래밍", "데이터 분석", "인공지능", "정보 윤리", "보안"], include: ["정보", "인공지능", "ai", "알고리즘", "데이터", "프로그래밍", "코딩", "머신러닝", "딥러닝", "컴퓨터", "소프트웨어", "보안"], exclude: ["고급화학", "ph", "플라스미드", "막전위"] }
];

function getIndexPath() { return path.join(process.cwd(), ".dharma", "knowledge-base-index.json"); }
async function ensureDir() { await fs.mkdir(path.dirname(getIndexPath()), { recursive: true }); }
function normalize(text: string) { return String(text || "").toLowerCase().replace(/\s+/g, " "); }
function cleanText(text: string) { return String(text || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(); }
function terms(input: SearchInput | { subject?: string; unit?: string; interest?: string; targetMajor?: string; topic?: string; query?: string }) { return [input.subject, input.unit, input.interest, input.targetMajor, input.topic, input.query].filter(Boolean).flatMap(v => String(v).split(/[\s,·/()_\\-]+/)).map(v => v.trim()).filter(v => v.length >= 2).slice(0, 40); }
function isTextFile(file: GoogleDriveFile) { const mime = String(file.mimeType || ""); const name = String(file.name || "").toLowerCase(); return mime.startsWith("text/") || mime.includes("csv") || Boolean(name.match(/\.(txt|md|csv|html|htm)$/)); }
function isReadable(file: GoogleDriveFile) { const mime = String(file.mimeType || ""); const name = String(file.name || "").toLowerCase(); if (name.includes("러셀광주근태관리")) return false; if (mime === GOOGLE_FOLDER_MIME) return false; return mime === GOOGLE_DOC_MIME || mime === GOOGLE_SHEET_MIME || mime === GOOGLE_PRESENTATION_MIME || isTextFile(file); }
async function fetchWithTimeout(url: string, accessToken: string, timeoutMs: number) { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs); try { return await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: controller.signal }); } finally { clearTimeout(timer); } }
async function fetchText(accessToken: string, file: GoogleDriveFile) { const id = file.id; const mime = String(file.mimeType || ""); try { if (mime === GOOGLE_DOC_MIME) { const r = await fetchWithTimeout(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/plain`, accessToken, 12000); return r.ok ? await r.text() : ""; } if (mime === GOOGLE_SHEET_MIME) { const r = await fetchWithTimeout(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/csv`, accessToken, 12000); return r.ok ? await r.text() : ""; } if (mime === GOOGLE_PRESENTATION_MIME) { const r = await fetchWithTimeout(`https://www.googleapis.com/drive/v3/files/${id}/export?mimeType=text/plain`, accessToken, 12000); return r.ok ? await r.text() : ""; } if (isTextFile(file)) { const r = await fetchWithTimeout(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, accessToken, 12000); return r.ok ? await r.text() : ""; } return ""; } catch { return ""; } }
function titleFromText(text: string, fallback: string) { const lines = text.split(/\n+/).map(line => cleanText(line)).filter(line => line.length >= 4 && line.length <= 160); return lines[0] || fallback; }
function splitSentences(text: string) { return cleanText(text).split(/(?<=[.!?。！？다요함음됨임])\s+/).map(s => s.trim()).filter(s => s.length >= 30); }
function summarize(text: string) { return splitSentences(text).slice(0, 5).join(" ").slice(0, 1200); }
function classify(text: string, hint?: { subject?: string; unit?: string; interest?: string; topic?: string }) { const body = normalize(text.slice(0, 40000)); const hintText = normalize(`${hint?.subject || ""} ${hint?.unit || ""} ${hint?.interest || ""} ${hint?.topic || ""}`); const scored = RULES.map(rule => { let score = 0; for (const term of rule.include) { const n = normalize(term); if (body.includes(n)) score += 8; if (hintText.includes(n)) score += 6; } for (const term of rule.exclude) { const n = normalize(term); if (body.includes(n)) score -= 8; if (hintText.includes(n)) score -= 4; } return { rule, score }; }).sort((a, b) => b.score - a.score); return scored[0]?.rule || RULES[0]; }
function inferUnit(rule: SubjectRule, text: string) { const body = normalize(text); let best = rule.units[0] || "교과 핵심 개념"; let bestScore = -1; for (const unit of rule.units) { let score = 0; for (const token of unit.split(/[\s·,]+/)) if (token.length >= 2 && body.includes(normalize(token))) score += 1; if (score > bestScore) { best = unit; bestScore = score; } } return best; }
function extractKeywords(text: string, rule: SubjectRule) { const stop = new Set(["그리고", "그러나", "따라서", "이러한", "것이다", "한다", "있다", "대한", "관련", "자료", "내용", "탐구", "보고서", "과정", "중심", "통해", "에서", "으로", "하는"]); const counts = new Map<string, number>(); const body = cleanText(text); for (const token of body.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/)) { const t = token.trim(); if (t.length >= 2 && !stop.has(t)) counts.set(t, (counts.get(t) || 0) + 1); } for (const term of rule.include) if (normalize(body).includes(normalize(term))) counts.set(term, (counts.get(term) || 0) + 7); return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([term]) => term).slice(0, 16); }
function chunkText(text: string) { const cleaned = cleanText(text); const chunks: string[] = []; let start = 0; while (start < cleaned.length) { const end = Math.min(start + CHUNK_SIZE, cleaned.length); const chunk = cleaned.slice(start, end).trim(); if (chunk.length >= 120) chunks.push(chunk); if (end >= cleaned.length) break; start = Math.max(0, end - CHUNK_OVERLAP); } return chunks; }
function emptyIndex(): KnowledgeBaseIndex { return { version: INDEX_VERSION, indexedAt: new Date().toISOString(), totalFilesListed: 0, totalReadableFiles: 0, indexedFiles: 0, totalChunks: 0, items: [], chunks: [], errors: [] }; }
export async function readKnowledgeBaseIndex(): Promise<KnowledgeBaseIndex | null> { try { return JSON.parse(await fs.readFile(getIndexPath(), "utf-8")) as KnowledgeBaseIndex; } catch { return null; } }
async function writeIndex(index: KnowledgeBaseIndex) { await ensureDir(); await fs.writeFile(getIndexPath(), JSON.stringify(index, null, 2), "utf-8"); }
export async function buildKnowledgeBaseIndex(accessToken: string, options: { limit?: number; mode?: "rebuild" | "incremental" } = {}) { const mode = options.mode || "incremental"; const limit = options.limit && options.limit > 0 ? options.limit : 300; const now = new Date().toISOString(); const existing = mode === "incremental" ? await readKnowledgeBaseIndex() : null; const previous = existing || emptyIndex(); const previousByFileId = new Map(previous.items.map(item => [item.fileId, item])); const files = await listDriveFilesWithAccessToken(accessToken); const readable = files.filter(isReadable); let items = mode === "incremental" ? [...previous.items] : []; let chunks = mode === "incremental" ? [...previous.chunks] : []; const errors = mode === "incremental" ? [...previous.errors].slice(-30) : []; let processed = 0; let skippedUnchanged = 0; for (const file of readable) { if (processed >= limit) break; const old = previousByFileId.get(file.id); if (mode === "incremental" && old && old.modifiedTime === file.modifiedTime) { skippedUnchanged += 1; continue; } processed += 1; try { const text = cleanText(await fetchText(accessToken, file)); if (text.length < 120) { errors.push(`${file.name}: 본문이 너무 짧거나 추출되지 않았습니다.`); continue; } const rule = classify(text, { subject: file.name }); const unit = inferUnit(rule, text); const keywords = extractKeywords(text, rule); const topic = `${unit}과 ${keywords.slice(0, 3).join(", ")}의 관계를 중심으로 한 ${rule.key} 탐구`; const title = titleFromText(text, file.name); const rawChunks = chunkText(text); const itemId = `kb_${file.id}`; items = items.filter(item => item.fileId !== file.id); chunks = chunks.filter(chunk => chunk.fileId !== file.id); const newItem: KBIndexItem = { id: itemId, fileId: file.id, fileName: file.name, title, mimeType: file.mimeType || "", modifiedTime: file.modifiedTime, webViewLink: file.webViewLink, subject: rule.key, unit, topic, keywords, summary: summarize(text), extractedLength: text.length, chunkCount: rawChunks.length, indexedAt: now }; const newChunks: KBIndexChunk[] = rawChunks.map((chunk, index) => ({ id: `${itemId}_chunk_${index + 1}`, itemId, fileId: file.id, fileName: file.name, title, subject: rule.key, unit, topic, keywords, chunkIndex: index + 1, text: chunk })); items.push(newItem); chunks.push(...newChunks); } catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : "색인 실패"}`); } } const index: KnowledgeBaseIndex = { version: INDEX_VERSION, indexedAt: now, totalFilesListed: files.length, totalReadableFiles: readable.length, indexedFiles: items.length, totalChunks: chunks.length, items, chunks, errors: errors.slice(-100) }; await writeIndex(index); return { ok: true, mode, processed, skippedUnchanged, totalFilesListed: files.length, totalReadableFiles: readable.length, indexedFiles: index.indexedFiles, totalChunks: index.totalChunks, indexedAt: index.indexedAt, errors: index.errors, sampleItems: items.slice(-10).reverse() }; }
function scoreChunk(chunk: KBIndexChunk, input: SearchInput) { const searchTerms = terms(input); const query = normalize(`${input.subject || ""} ${input.unit || ""} ${input.interest || ""} ${input.topic || ""} ${input.query || ""}`); const text = normalize(`${chunk.title} ${chunk.subject} ${chunk.unit} ${chunk.topic} ${chunk.keywords.join(" ")} ${chunk.text}`); let score = 0; if (input.subject && normalize(chunk.subject).includes(normalize(input.subject))) score += 50; if (input.subject && query.includes(normalize(chunk.subject))) score += 35; if (input.unit && normalize(chunk.unit).includes(normalize(input.unit))) score += 30; if (input.interest && normalize(chunk.topic).includes(normalize(input.interest))) score += 20; for (const keyword of chunk.keywords) if (query.includes(normalize(keyword))) score += 12; for (const term of searchTerms) if (text.includes(normalize(term))) score += 6; return score; }
export async function searchKnowledgeBaseIndex(input: SearchInput) { const index = await readKnowledgeBaseIndex(); if (!index || index.chunks.length === 0) return { ok: false, message: "Knowledge Base 본문 인덱스가 없습니다. 관리자 페이지에서 본문 인덱싱을 먼저 실행해 주세요.", chunks: [], items: [] }; const scored = index.chunks.map(chunk => ({ chunk, score: scoreChunk(chunk, input) })).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, input.limit || 10); const itemIds = new Set(scored.map(entry => entry.chunk.itemId)); const items = index.items.filter(item => itemIds.has(item.id)); return { ok: true, indexedAt: index.indexedAt, totalChunks: index.totalChunks, totalItems: index.indexedFiles, chunks: scored.map(entry => ({ ...entry.chunk, score: entry.score })), items }; }
export async function getKnowledgeBaseIndexStatus() { const index = await readKnowledgeBaseIndex(); if (!index) return { ok: true, exists: false, message: "본문 인덱스가 아직 없습니다." }; const subjects = Array.from(new Set(index.items.map(item => item.subject))).sort(); return { ok: true, exists: true, indexedAt: index.indexedAt, totalFilesListed: index.totalFilesListed, totalReadableFiles: index.totalReadableFiles, indexedFiles: index.indexedFiles, totalChunks: index.totalChunks, subjects, errors: index.errors.slice(-20), sampleItems: index.items.slice(-10).reverse() }; }
