const url = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const APPLY = process.env.APPLY === "1";

if (!url || !key) {
  throw new Error(
    "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다."
  );
}

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "");
}

function hasAny(text, words) {
  return words.some((word) => text.includes(normalize(word)));
}

function inferSubject(name) {
  const n = normalize(name);
  
   // 0. 세특 자료는 최우선으로 별도 분류
  if (n.includes("세특")) return "세특";

  // 1. 창의적 체험활동 분류
  // 파일명 앞부분이 활동명을 나타내면 교과보다 먼저 분류한다.
  if (n.startsWith("동아리")) return "동아리";

  if (
    n.startsWith("자율") ||
    n.startsWith("지율")
  )
    return "자율";

  if (
    n.startsWith("진로") ||
    n.startsWith("진로활동")
  )
    return "진로";

  // 2. 파일명에 과목명이 직접 적혀 있는 경우를 최우선 처리

  if (hasAny(n, ["과학탐구실험"])) return "과학탐구실험";
  if (hasAny(n, ["통합과학"])) return "통합과학";
  if (hasAny(n, ["융합과학"])) return "융합과학";
  if (hasAny(n, ["생태와환경", "생태와 환경"])) return "생태와 환경";
  // 사회·역사 계열
if (hasAny(n, ["한국사"])) return "한국사";
if (hasAny(n, ["세계사"])) return "세계사";
if (hasAny(n, ["동아시아사"])) return "동아시아사";

if (hasAny(n, ["한국지리"])) return "한국지리";
if (hasAny(n, ["세계지리"])) return "세계지리";
if (hasAny(n, ["여행지리"])) return "여행지리";

if (hasAny(n, ["사회문화", "사회·문화"])) return "사회문화";
if (hasAny(n, ["경제"])) return "경제";

if (
  hasAny(n, [
    "정치와법",
    "정치와 법",
  ])
)
  return "정치와법";

if (
  hasAny(n, [
    "생활과윤리",
    "생활과 윤리",
  ])
)
  return "생활과윤리";

if (
  hasAny(n, [
    "윤리와사상",
    "윤리와 사상",
  ])
)
  return "윤리와사상";


// 국어 계열
if (hasAny(n, ["언어와매체", "언어와 매체"])) return "국어";
if (hasAny(n, ["화법과작문", "화법과 작문"])) return "국어";
if (hasAny(n, ["독서"])) return "국어";
if (hasAny(n, ["문학"])) return "국어";


// 외국어 계열
if (hasAny(n, ["영어독해", "영어회화", "영어권문화"])) return "영어";
if (hasAny(n, ["일본어"])) return "일본어";
if (hasAny(n, ["중국어"])) return "중국어";
if (hasAny(n, ["프랑스어"])) return "프랑스어";
if (hasAny(n, ["독일어"])) return "독일어";


// 수학 계열
if (hasAny(n, ["공통수학"])) return "수학";
if (hasAny(n, ["대수"])) return "수학";
if (hasAny(n, ["미적분"])) return "수학";
if (hasAny(n, ["확률과통계", "확률과 통계"])) return "수학";
if (hasAny(n, ["기하"])) return "수학";


// 과학 계열
if (hasAny(n, ["물리학", "물리"])) return "물리";
if (hasAny(n, ["화학"])) return "화학";
if (hasAny(n, ["생명과학"])) return "생명과학";
if (hasAny(n, ["지구과학"])) return "지구과학";


// 예체능
if (hasAny(n, ["음악"])) return "음악";
if (hasAny(n, ["미술"])) return "미술";
if (hasAny(n, ["체육", "스포츠생활", "스포츠 생활"])) return "체육";


// 기술·정보·생활 계열
if (hasAny(n, ["정보"])) return "정보";
if (hasAny(n, ["인공지능기초", "인공지능 기초"])) return "정보";
if (hasAny(n, ["기술가정", "기술·가정", "기술 가정"])) return "기술가정";
if (hasAny(n, ["가정과학"])) return "가정과학";


// 선택·융합 과목
if (hasAny(n, ["환경"])) return "환경";
if (n.startsWith("교육학")) return "교육학";
if (n.startsWith("심리학")) return "심리학";

if (hasAny(n, ["교육학"])) return "교육학";
if (hasAny(n, ["심리학"])) return "심리학";
if (hasAny(n, ["철학"])) return "철학";
if (hasAny(n, ["논리학"])) return "논리학";
  if (
    hasAny(n, [
      "생명과학1",
      "생명과학2",
      "생명과학Ⅰ",
      "생명과학Ⅱ",
      "생명과학",
    ])
  )
    return "생명과학";

  if (
    hasAny(n, [
      "물리학1",
      "물리학2",
      "물리학Ⅰ",
      "물리학Ⅱ",
      "물리학",
      "물리_",
    ])
  )
    return "물리";

  if (
    hasAny(n, [
      "지구과학1",
      "지구과학2",
      "지구과학Ⅰ",
      "지구과학Ⅱ",
      "지구과학",
    ])
  )
    return "지구과학";

  if (
    hasAny(n, [
      "화학1",
      "화학2",
      "화학Ⅰ",
      "화학Ⅱ",
      "화학",
    ])
  )
    return "화학";

  if (
    hasAny(n, [
      "미적분",
      "확률과통계",
      "확률과 통계",
      "공통수학",
      "기하",
      "대수",
      "수학1",
      "수학2",
      "수학Ⅰ",
      "수학Ⅱ",
      "수학",
    ])
  )
    return "수학";

  if (hasAny(n, ["사회문제탐구"])) return "사회문제탐구";
  if (hasAny(n, ["사회문화"])) return "사회문화";
  if (hasAny(n, ["통합사회"])) return "통합사회";
  if (hasAny(n, ["경제"])) return "경제";
  if (hasAny(n, ["정치와법", "정치와 법"])) return "정치와법";

  if (hasAny(n, ["윤리와사상", "윤리와 사상"])) return "윤리와사상";
  if (hasAny(n, ["생활과윤리", "생활과 윤리"])) return "생활과윤리";

  if (hasAny(n, ["화법과작문", "화법과 작문"])) return "국어";
  if (hasAny(n, ["언어와매체", "언어와 매체"])) return "국어";
  if (hasAny(n, ["국어", "문학", "독서"])) return "국어";

  if (hasAny(n, ["한문"])) return "한문";

  if (hasAny(n, ["영어", "english"])) return "영어";

  if (
    hasAny(n, [
      "정보",
      "인공지능기초",
      "인공지능 기초",
      "정보과학",
    ])
  )
    return "정보";

  if (hasAny(n, ["음악"])) return "음악";
  if (hasAny(n, ["미술"])) return "미술";
  if (hasAny(n, ["체육", "스포츠생활", "스포츠 생활"])) return "체육";

   // 과학·융합 계열
  if (hasAny(n, ["과탐실", "과학탐구실험"])) return "과학탐구실험";

  if (hasAny(n, ["공학일반"])) return "공학일반";

  if (hasAny(n, ["물질과에너지", "물질과 에너지"]))
    return "물질과 에너지";

  if (hasAny(n, ["생활과과학", "생활과 과학"]))
    return "생활과 과학";

  if (hasAny(n, ["과학과제연구", "과학과제 연구"]))
    return "과학과제연구";

  if (
    hasAny(n, [
      "과학탐구활동",
      "과학 탐구 활동",
      "과학탐구",
      "과학 탐구",
    ])
  )
    return "과학탐구";

  if (hasAny(n, ["공통과학2", "공통과학Ⅱ", "공통과학"]))
    return "공통과학";

  if (hasAny(n, ["보건"])) return "보건";

  
  if (hasAny(n, ["기술발명", "기술 발명"]))
    return "기술가정";

  if (hasAny(n, ["과학"])) return "과학";

  // 3. 남은 미분류 자료 - 제목 내용 기준 세부 분류

  if (hasAny(n, ["팩트풀니스"]))
  return "자율, 진로";

if (hasAny(n, ["고3생기부의예진로", "고3 생기부 의예 진로"]))
  return "진로";

// 사용자가 지정한 고정 분류
if (
  n.includes("고3") &&
  n.includes("생기부") &&
  n.includes("의예") &&
  n.includes("진로")
)
  return "진로";
  
if (hasAny(n, ["3학년전과목주제추천", "반도체공학과"]))
  return "물리";

// 융합 프로젝트
if (hasAny(n, ["교과융합탐구프로젝트소감문"]))
  return "융합과학";

// 법·정치·사회
if (hasAny(n, ["국제법"]))
  return "정치와법";

if (hasAny(n, ["로비스트", "로봇세도입"]))
  return "사회문제탐구";

if (hasAny(n, ["신약특허권"]))
  return "정치와법";

if (hasAny(n, ["gmo와소비자의알권리", "gmo와소비자의알권리"]))
  return "정치와법";

if (hasAny(n, ["인재전쟁"]))
  return "사회문제탐구";

if (
  hasAny(n, [
    "숏폼콘텐츠",
    "청소년소비자의충동구매",
  ])
)
  return "사회문제탐구";

// 생명과학·의학
if (
  hasAny(n, [
    "탄산칼슘이온",
    "갑각류의생장",
    "갑각류생장",
  ])
)
  return "생명과학";

if (
  hasAny(n, [
    "세균배양원리",
    "손소독제의살균원리",
    "항생제감수성검사",
    "내성전쟁",
  ])
)
  return "생명과학";

if (
  hasAny(n, [
    "로렌조오일",
    "대사성질환",
  ])
)
  return "생명과학";

// 심리학
if (
  hasAny(n, [
    "미움받을용기",
    "생각에관한생각",
    "대니얼카너먼",
    "분노에관하여",
  ])
)
  return "심리학";

// 보건
if (hasAny(n, ["식사혁명"]))
  return "보건";

// 환경
if (
  hasAny(n, [
    "침묵의봄",
    "도시광산",
    "폐전자제품",
    "자원순환",
  ])
)
  return "환경";

// 체육
if (
  hasAny(n, [
    "운동후냉수욕",
    "근육회복",
  ])
)
  return "체육";

// 물리
if (
  hasAny(n, [
    "자동차서스펜션",
    "가변감쇠메커니즘",
    "진동최소화설계",
  ])
)
  return "물리";

// 윤리
if (hasAny(n, ["타인의고통에응답하는공부"]))
  return "윤리와사상";

// 진로
if (
  hasAny(n, [
    "직업의세계보고서",
    "직업인멘토",
    "학교생활혁신프로젝트보고서",
    "고3생기부의예진로",
  ])
)
  return "진로";

// 교육학
if (
  hasAny(n, [
    "사교육의존",
    "공교육내학습격차",
    "교사의역할",
    "교육과기술의경주",
  ])
)
  return "교육학";

// 경제
if (
  hasAny(n, [
    "국민연금고갈",
    "기금운용수익률",
    "esg투자",
    "스타벅스의마케팅전략",
    "파노플리효과",
    "왝더독",
  ])
)
  return "경제";

// 정보
if (
  hasAny(n, [
    "이미테이션게임",
    "앨런튜링",
  ])
)
  return "정보";

// 국어
if (
  hasAny(n, [
    "고려가요",
    "하늘끝까지솟아나리",
  ])
)
  return "국어";

// 기술·가정
if (
  hasAny(n, [
    "기술발명프로젝트",
    "스마트안전약병",
  ])
)
  return "기술가정";

  // 4. 과목명이 명확하지 않은 경우에만 주제 키워드로 추론

  if (
    hasAny(n, [
      "dna",
      "rna",
      "유전자",
      "유전체",
      "세포",
      "면역",
      "미생물",
      "단백질",
      "효소",
      "아가로스",
      "전기영동",
      "헤모글로빈",
      "atp",
      "막전위",
      "알츠하이머",
      "신경세포",
    ])
  )
    return "생명과학";

  if (
    hasAny(n, [
      "전자기",
      "자기장",
      "전자기유도",
      "맥스웰",
      "패러데이",
      "뉴턴",
      "양자",
      "레이저",
      "광학",
      "역학",
      "베르누이",
      "마그누스",
    ])
  )
    return "물리";

  if (
    hasAny(n, [
      "지질",
      "대기",
      "기상",
      "해양",
      "천문",
      "행성",
      "지진",
      "지진해일",
      "화산",
      "판구조론",
      "마그마",
    ])
  )
    return "지구과학";

  if (
    hasAny(n, [
      "산염기",
      "중화반응",
      "이성질체",
      "화학평형",
      "분자구조",
      "산화환원",
      "몰농도",
    ])
  )
    return "화학";

  if (
    hasAny(n, [
      "함수",
      "미분",
      "적분",
      "수열",
      "순열",
      "조합",
      "벡터",
      "확률",
      "통계",
      "극한",
    ])
  )
    return "수학";

  if (
    hasAny(n, [
      "칸트",
      "롤스",
      "공리주의",
      "의무론",
      "덕윤리",
    ])
  )
    return "윤리와사상";

  if (
    hasAny(n, [
      "사회문제",
      "사회갈등",
      "불평등",
      "인권",
      "저출산",
      "고령화",
      "사회정책",
    ])
  )
    return "사회문제탐구";

  if (
    hasAny(n, [
      "알고리즘",
      "프로그래밍",
      "코딩",
      "머신러닝",
      "딥러닝",
      "데이터베이스",
    ])
  )
    return "정보";

  if (
    hasAny(n, [
      "작곡",
      "화성학",
      "음계",
      "리듬",
      "선율",
      "국악",
    ])
  )
    return "음악";

  if (
    hasAny(n, [
      "회화",
      "조형",
      "색채",
      "조각",
      "드로잉",
      "시각예술",
    ])
  )
    return "미술";

  if (
    hasAny(n, [
      "운동생리",
      "스포츠",
      "체력",
      "육상",
      "축구",
      "농구",
      "배구",
    ])
  )
    return "체육";

  return null;
}

async function loadPendingMaterials() {
  const params = new URLSearchParams({
    select: "id,file_name,title,subject",
    subject: "eq.분류 대기",
    limit: "1000",
  });

  const response = await fetch(
    `${url}/rest/v1/dharma_materials?${params.toString()}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `자료 조회 실패: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

async function updateSubject(id, subject) {
  const params = new URLSearchParams({
    id: `eq.${id}`,
  });

  const response = await fetch(
    `${url}/rest/v1/dharma_materials?${params.toString()}`,
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
      `수정 실패 (${id}): ${response.status} ${await response.text()}`
    );
  }
}

const rows = await loadPendingMaterials();

console.log(`분류 대기 자료: ${rows.length}개`);

const counts = {};
const changes = [];
const unresolved = [];

for (const row of rows) {
  const sourceText = `${row.file_name || ""} ${row.title || ""}`;
  const subject = inferSubject(sourceText);

  if (!subject) {
    unresolved.push(row);
    continue;
  }

  changes.push({
    id: row.id,
    fileName: row.file_name,
    subject,
  });

  counts[subject] = (counts[subject] || 0) + 1;
}

console.log("\n재분류 예상 결과");
console.table(counts);

console.log(`재분류 가능: ${changes.length}개`);
console.log(`아직 판단 불가: ${unresolved.length}개`);
import { writeFileSync } from "node:fs";

const unresolvedText = unresolved
  .map((item, index) => `${index + 1}. ${item.file_name || item.title || ""}`)
  .join("\n");

writeFileSync(
  "scripts/unresolved-subjects.txt",
  unresolvedText,
  "utf8"
);

console.log(
  "미분류 파일 목록 저장: scripts/unresolved-subjects.txt"
);
if (!APPLY) {
  console.log("\n현재는 미리보기(DRY RUN)입니다.");
  console.log("DB는 수정하지 않았습니다.");
  console.log("\n샘플:");
  console.table(changes.slice(0, 30));
  
}

if (APPLY) {
  let updated = 0;

  for (const item of changes) {
    await updateSubject(item.id, item.subject);
    updated += 1;

    if (updated % 50 === 0) {
      console.log(`${updated}/${changes.length}개 수정 완료`);
    }
  }

  console.log(`\n실제 재분류 완료: ${updated}개`);
  console.log(`분류 대기 유지: ${unresolved.length}개`);
}