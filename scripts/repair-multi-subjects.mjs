const url = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "");
const APPLY = process.env.APPLY === "1";

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다."
  );
}

const SUBJECT_ALIASES = new Map([
  ["국어", "국어"],
  ["공통국어", "국어"],

  ["수학", "수학"],
  ["공통수학", "수학"],
  ["미적분", "수학"],
  ["미적분1", "수학"],
  ["미적분Ⅰ", "수학"],
  ["기하", "수학"],
  ["대수", "수학"],
  ["확률과 통계", "수학"],
  ["확률과통계", "수학"],
  ["수학1", "수학"],
  ["수학2", "수학"],
  ["수학Ⅰ", "수학"],
  ["수학Ⅱ", "수학"],

  ["과학", "과학"],
  ["통합과학", "통합과학"],
  ["융합과학", "융합과학"],
  ["과학탐구실험", "과학탐구실험"],
  ["과탐실", "과학탐구실험"],
  ["과학과제연구", "과학과제연구"],

  ["물리", "물리"],
  ["물리학", "물리"],
  ["물리학1", "물리"],
  ["물리학2", "물리"],

  ["화학", "화학"],

  ["생명과학", "생명과학"],
  ["생명과학1", "생명과학"],
  ["생명과학2", "생명과학"],

  ["지구과학", "지구과학"],
  ["지구과학1", "지구과학"],
  ["지구과학2", "지구과학"],

  ["정보", "정보"],
  ["인공지능", "정보"],
  ["인공지능 기초", "정보"],
  ["프로그래밍", "정보"],

  ["사회문제탐구", "사회문제탐구"],
  ["정치와법", "정치와법"],
  ["정치와 법", "정치와법"],
  ["경제", "경제"],
  ["세계지리", "세계지리"],
  ["한국사", "한국사"],
  ["윤리와사상", "윤리와사상"],

  ["교육학", "교육학"],
  ["심리학", "심리학"],
  ["보건", "보건"],
  ["환경", "환경"],
  ["음악", "음악"],
  ["미술", "미술"],
  ["체육", "체육"],
  ["한문", "한문"],
  ["일본어", "일본어"],
  ["프랑스어", "프랑스어"],
  ["통합사회", "통합사회"],
  ["공통사회", "통합사회"],

  ["생명", "생명과학"],
  ["생명과학1", "생명과학"],
  ["생명과학2", "생명과학"],
  ["생명과학Ⅰ", "생명과학"],
  ["생명과학Ⅱ", "생명과학"],

  ["화학1", "화학"],
  ["화학2", "화학"],
  ["화학Ⅰ", "화학"],
  ["화학Ⅱ", "화학"],

  ["영어", "영어"],
  ["영어1", "영어"],
  ["영어2", "영어"],

  ["스포츠", "체육"],
  ["스포츠생활", "체육"],
  ["스포츠 생활", "체육"],
  ["심리", "심리학"],
  ["철학", "윤리와사상"],

  ["사회", "사회문제탐구"],
  ["통합사회", "통합사회"],
  ["공통사회", "통합사회"],
  ["음악*감상과 비평", "음악"],
  ["음악감상과 비평", "음악"],
  ["음악 감상과 비평", "음악"],

  ["생명윤리", "윤리와사상"],
  ["약학", "진로"],
  ["의예", "진로"],
  ["의학", "진로"],
  ["동아리", "동아리"],
  ["자율", "자율"],
  ["진로", "진로"],
]);

function extractSubjects(fileName = "") {
  const base = String(fileName)
    .replace(/\.(hwp|hwpx|docx)$/i, "")
    .trim();

  const parts = base.split("_").map((v) => v.trim()).filter(Boolean);

  const found = [];

  // 파일명 앞부분의 연속된 교과/활동명만 읽음
  for (const part of parts) {
    const cleanedPart = part.replace(/\*/g, "").trim();
    const normalized = SUBJECT_ALIASES.get(cleanedPart);

    if (!normalized) {
      break;
    }

    if (!found.includes(normalized)) {
      found.push(normalized);
    }
  }

  return found;
}

async function fetchAllRows() {
  const PAGE_SIZE = 1000;
  const allRows = [];

  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;

    const response = await fetch(
      `${url}/rest/v1/dharma_materials?select=id,file_name,title,subject&order=file_name.asc`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Range: `${from}-${to}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const rows = await response.json();

    allRows.push(...rows);

    if (rows.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return allRows;
}

async function updateSubject(id, subject) {
  const response = await fetch(
    `${url}/rest/v1/dharma_materials?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        subject,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `수정 실패 ${id}: ${await response.text()}`
    );
  }
}

const rows = await fetchAllRows();

const changes = [];

for (const row of rows) {
  const fileName = row.file_name || row.title || "";
  const subjects = extractSubjects(fileName);

  // 2개 이상의 명확한 교과/활동명이 연속해서 있을 때만 복수 분류
  if (subjects.length < 2) continue;

  const nextSubject = subjects.join(", ");

  if (row.subject !== nextSubject) {
    changes.push({
      id: row.id,
      fileName,
      from: row.subject,
      to: nextSubject,
    });
  }
}

console.log(`전체 자료: ${rows.length}개`);
console.log(`복수 과목 재분류 대상: ${changes.length}개\n`);

console.table(changes);

if (!APPLY) {
  console.log("\n현재는 미리보기(DRY RUN)입니다.");
  console.log("DB는 수정하지 않았습니다.");
} else {
  let updated = 0;

  for (const item of changes) {
    await updateSubject(item.id, item.to);
    updated += 1;

    if (updated % 20 === 0) {
      console.log(`${updated}/${changes.length}개 수정 완료`);
    }
  }

  console.log(`\n실제 복수 과목 재분류 완료: ${updated}개`);
}