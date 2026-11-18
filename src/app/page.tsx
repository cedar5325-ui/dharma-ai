"use client";

import { useEffect, useState } from "react";

import DharmaBusinessFooter from "../components/DharmaBusinessFooter";

const FALLBACK_LAST_UPGRADE_AT = "2026-08-14T18:24:03+09:00";

function formatKstDateTime(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "2026.08.14", time: "18:24:03" };
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsed);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "00";

  return {
    date: `${get("year")}.${get("month")}.${get("day")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

function DigitalUpgradeClock() {
  const fallbackRaw =
    process.env.NEXT_PUBLIC_DHARMA_LAST_UPGRADE_AT ||
    FALLBACK_LAST_UPGRADE_AT;

  const [raw, setRaw] = useState(fallbackRaw);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestMaterialTime() {
      try {
        const response = await fetch("/api/system/latest-material-upload", {
          cache: "no-store",
        });
        const json = await response.json();

        if (!cancelled && response.ok && json?.ok && json?.lastUploadAt) {
          setRaw(String(json.lastUploadAt));
        }
      } catch {
        // API 실패 시 fallback 값을 유지합니다.
      }
    }

    loadLatestMaterialTime();
    const timer = window.setInterval(loadLatestMaterialTime, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const display = formatKstDateTime(raw);

  return (
    <aside className="upgradeClock" aria-label="다르마 자료 마지막 업데이트 시각">
      <div className="upgradeClockTop">
        <span className="upgradeDot" aria-hidden="true" />
        <span>LAST MATERIAL UPDATE</span>
      </div>
      <time className="upgradeDigits" dateTime={raw}>
        <span className="upgradeDate">{display.date}</span>
        <span className="upgradeTime">{display.time}</span>
        <span className="upgradeZone">KST</span>
      </time>
      <small>DHARMA MATERIALS UPDATED</small>
    </aside>
  );
}
const REPORT_SHOWCASES = [
  {
    subject: "미적분Ⅰ",
    title: "휴대폰 배터리 충전 곡선",
    subtitle: "실제 충전 데이터를 미분으로 분석하다",
    flow: [
  {
    label: "고등학교 교과과정",
    text: "미적분Ⅰ의 함수, 도함수, 순간변화율과 함수의 증가·감소 개념을 활용합니다.",
  },
  {
    label: "탐구 내용",
    text: "휴대폰 충전 데이터를 함수로 모델링하고, 도함수로 충전 속도가 가장 빠른 시점과 이후 속도가 감소하는 구간을 분석합니다.",
  },
  {
    label: "실생활 적용",
    text: "배터리 잔량과 충전 속도의 관계를 통해 효율적인 충전 시간과 적정 충전 범위를 해석합니다.",
  },
  {
    label: "후속질문 · 확장",
    text: "유선·무선 충전의 충전 곡선과 배터리 온도 변화를 비교하여 충전 방식에 따른 효율 차이로 확장합니다.",
  },
],
    images: [
      "/sample-reports/battery-1.png",
    ],
    href: "/materials?subject=수학",
    tone: "blue",
  },

  {
    subject: "생명과학",
    title: "세균의 세포벽 구조에 따른 엔도리신의 작용 차이",
    subtitle: "세포 구조에서 항생제 대체 기술까지",
    flow: [
  {
    label: "고등학교 교과과정",
    text: "생명과학의 세포 구조, 세포막과 세포벽, 효소의 기질특이성 개념과 연결됩니다.",
  },
  {
    label: "탐구 내용",
    text: "그람양성균과 그람음성균의 세포벽·외막 구조를 비교하고, 구조 차이가 엔도리신의 접근성과 항균 작용에 미치는 영향을 분석합니다.",
  },
  {
    label: "실생활 적용",
    text: "항생제 내성균에 대응하기 위한 박테리오파지 유래 항균 효소의 활용 가능성을 살펴봅니다.",
  },
  {
    label: "후속질문 · 확장",
    text: "그람음성균의 외막 장벽을 극복하기 위한 엔도리신 개량과 온도·pH 조건에 따른 활성 변화 탐구로 확장합니다.",
  },
],
    images: [
      "/sample-reports/endolysin-1.png",
    ],
    href: "/materials?subject=생명과학",
    tone: "green",
  },

  {
    subject: "기하",
    title: "GPS 위치 결정의 공간좌표 원리와 철새 이동 경로 분석",
    subtitle: "공간좌표와 벡터를 실제 위치추적에 적용하다",
    flow: [
  {
    label: "고등학교 교과과정",
    text: "기하의 공간좌표, 두 점 사이 거리, 구의 방정식, 벡터와 내적 개념을 활용합니다.",
  },
  {
    label: "탐구 내용",
    text: "여러 위성과의 거리 조건으로 수신기의 위치를 계산하고, 위치좌표와 벡터를 이용해 철새의 이동 거리·방향·속력을 분석합니다.",
  },
  {
    label: "실생활 적용",
    text: "GPS 위치결정, 내비게이션, 야생동물 위치추적과 생태 연구에 수학적 원리가 어떻게 활용되는지 확인합니다.",
  },
  {
    label: "후속질문 · 확장",
    text: "실제 철새 이동 데이터에 기후·먹이·서식지 정보를 결합해 이동 패턴과 환경 요인의 관계를 분석하는 방향으로 확장합니다.",
  },
],
    images: [
      "/sample-reports/gps-1.png",
    ],
    href: "/materials?subject=수학",
    tone: "purple",
  },

  {
    subject: "물리학 실험",
    title: "도체의 전류 순환 경로와 와전류 제동 효과",
    subtitle: "전자기 유도를 실험으로 검증하다",
    flow: [
  {
    label: "고등학교 교과과정",
    text: "물리학의 전자기 유도, 패러데이 법칙, 렌츠 법칙, 뉴턴 운동 법칙과 에너지 보존 개념을 활용합니다.",
  },
  {
    label: "탐구 내용",
    text: "구리·알루미늄·아크릴관과 절개 여부를 변인으로 설정해 자석의 낙하 속력과 가속도를 비교하고 와전류 제동 효과를 분석합니다.",
  },
  {
    label: "실생활 적용",
    text: "고속열차·엘리베이터 등에서 활용되는 비접촉 전자기 제동과 자기 제동 기술의 원리를 이해할 수 있습니다.",
  },
  {
    label: "후속질문 · 확장",
    text: "도체의 전기전도도, 두께, 전류 순환 경로와 제동력의 관계 및 에너지 전환 과정으로 실험을 확장할 수 있습니다.",
  },
],
    images: [
      "/sample-reports/eddy-1.png",
    ],
    href: "/materials?subject=물리",
    tone: "orange",
  },

  {
    subject: "화학",
    title: "활성산소에 의한 세포막·DNA 손상과 항산화 작용",
    subtitle: "산화·환원 개념을 생명현상으로 확장하다",
    flow: [
  {
    label: "고등학교 교과과정",
    text: "화학의 산화·환원 반응, 전자 이동, 산화수와 반응성 개념을 생명현상과 연결합니다.",
  },
  {
    label: "탐구 내용",
    text: "활성산소가 세포막 지질과 DNA를 산화시키는 과정과 비타민 C 등 항산화 물질이 전자를 제공해 이를 조절하는 원리를 분석합니다.",
  },
  {
    label: "실생활 적용",
    text: "노화, 세포 손상, 질환과 항산화 작용을 화학적 산화·환원 반응의 관점에서 이해합니다.",
  },
  {
    label: "후속질문 · 확장",
    text: "활성산소의 생성·제거 균형, 항산화 효소와 생체 항상성, 질환 발생과의 관계를 더 깊게 탐구할 수 있습니다.",
  },
],
    images: [
      "/sample-reports/ros-1.png",
    ],
    href: "/materials?subject=화학",
    tone: "red",
  },

  {
    subject: "컴퓨터 시스템",
    title: "오버플로우 검출 회로와 불 대수",
    subtitle: "수학적 논리에서 실제 디지털 회로까지",
    flow: [
  {
    label: "고등학교 교과과정",
    text: "컴퓨터 시스템의 이진수 표현, 논리게이트, 가산기, 조합논리회로와 불 대수 개념을 활용합니다.",
  },
  {
    label: "탐구 내용",
    text: "반가산기·전가산기·리플 캐리 가산기의 구조를 바탕으로 오버플로우 조건을 분석하고 불 대수로 검출 논리식을 간소화합니다.",
  },
  {
    label: "실생활 적용",
    text: "CPU와 디지털 회로에서 연산 결과가 표현 범위를 벗어났는지 검출하고 오류를 처리하는 원리와 연결됩니다.",
  },
  {
    label: "후속질문 · 확장",
    text: "XOR 기반 검출 회로, 비트 폭 증가, 캐리 전파 지연과 고속 가산기 설계 문제로 확장할 수 있습니다.",
  },
],
    images: [
      "/sample-reports/overflow-1.png",
    ],
    href: "/materials?subject=정보",
    tone: "indigo",
  },
];
export default function HomePage() {
  const [homeSubjects, setHomeSubjects] = useState<
    Array<{ subject: string; count: number }>
  >([]);

  useEffect(() => {
    async function loadHomeSubjects() {
      try {
        const response = await fetch(
          `/api/materials/subjects?t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        setHomeSubjects(
          Array.isArray(data.subjects)
            ? data.subjects
            : []
        );
      } catch (error) {
        console.error("홈페이지 과목 목록 조회 오류:", error);
      }
    }

    loadHomeSubjects();
  }, []);

  return (
    <main className="page">
      <header className="header">
        <strong className="brand">다르마(DHARMA) AI</strong>
        <nav className="nav">
          <a href="/">홈</a>
          <a href="/materials">자료 다운로드</a>
          <a href="/pricing">요금</a>
          <a href="/admin/storage">관리자 Storage</a>
        </nav>
      </header>

      <section className="hero">
        <div className="heroTop">
          <div className="eyebrow">DHARMA VERIFIED MATERIALS</div>
          <div className="heroStatus">
            <DigitalUpgradeClock />
            <div className="verifiedBadge">교차 검증 완료</div>
          </div>
        </div>

        <h1>
          중고교 수행평가를 위한
          <br />
          교과,도서 연계 심화 탐구 보고서
        </h1>

        <p className="heroText">
          다르마는 단순 자료 판매가 아니라, 교과 개념에서 출발해 심화 탐구,
          관련 도서 활동, 느낀점까지 자연스럽게 이어지는 고퀄리티 탐구 보고서 자료를 제공합니다.
        </p>

        <div className="actions">
          <a className="primary" href="/materials">자료 선택하고 다운로드</a>
          <a className="ghost" href="/pricing">요금 확인</a>
        </div>

        <div className="cards3">
          <article className="card">
            <span>01</span>
            <h2>교과 연계 탐구</h2>
            <p>수업에서 배운 개념을 출발점으로 삼아 과목별 탐구 주제가 자연스럽게 확장되도록 구성합니다.</p>
          </article>

          <article className="card">
            <span>02</span>
            <h2>도서 연계 탐구</h2>
            <p>탐구 주제와 연결되는 도서 활동을 더해 학생부에 기록 가능한 사고의 깊이를 강화합니다.</p>
          </article>

          <article className="card">
            <span>03</span>
            <h2>교육과정 기반 심화</h2>
            <p>고등학교 교육과정에 충실하면서 진로와 과목 심화 역량이 드러나도록 설계합니다.</p>
          </article>
        </div>
      </section>
       <section className="subjectSection">
        <div className="subjectSectionHead">
          <div>
            <div className="eyebrow">DHARMA SUBJECTS</div>
            <h2>과목별 탐구 자료</h2>
            <p>
              실제 등록된 자료를 기준으로 과목이 자동 업데이트됩니다.
              원하는 과목을 선택해 바로 자료를 확인하세요.
            </p>
          </div>

          <a className="allMaterialsLink" href="/materials">
            전체 자료 보기
          </a>
        </div>

        <div className="homeSubjectChips">
          {homeSubjects.map((item) => (
            <a
              key={item.subject}
              className="homeSubjectChip"
              href={`/materials?subject=${encodeURIComponent(item.subject)}`}
            >
              <strong>{item.subject}</strong>
          
            </a>
          ))}
        </div>
      </section>
      <section className="showcaseSection">
  <div className="showcaseHead">
    <div>
      <div className="eyebrow">DHARMA REPORT PREVIEW</div>

      <h2>
        교과에서 시작해
        <br />
        <span>심화탐구로 확장되는 과정</span>
      </h2>

      <p>
        실제 탐구보고서가 어떤 흐름으로 완성되는지
        카드뉴스 형태로 미리 확인해보세요.
      </p>
    </div>

    <a href="/materials" className="showcaseAll">
      전체 자료 보기 →
    </a>
  </div>

  <div className="showcaseList">
    {REPORT_SHOWCASES.map((report, reportIndex) => (
      <article
        key={report.title}
        className={`showcaseCard ${report.tone}`}
      >
        <div className="showcaseNumber">
          REPORT {String(reportIndex + 1).padStart(2, "0")}
        </div>

        <div className="showcaseImages">
          {report.images.map((src, imageIndex) => (
            <div className="showcaseImageBox" key={src}>
              <div className="showcaseImageNumber">
                {imageIndex + 1}
              </div>

              <img
                src={src}
                alt={`${report.title} 이미지 ${imageIndex + 1}`}
                className="showcaseImage"
              />
            </div>
          ))}
        </div>

        <div className="showcaseBody">
          <div className="showcaseSubject">
            {report.subject}
          </div>

          <h3>{report.title}</h3>

          <p className="showcaseSubtitle">
            {report.subtitle}
          </p>

          <div className="theoryFlow">
           {report.flow.map((step, index) => (
            <div className="flowStep" key={step.label}>
             <div className="flowTop">
              <span className="flowNumber">
               {index + 1}
              </span>

              <strong>{step.label}</strong>
            </div>

            <p>{step.text}</p>

            {index < report.flow.length - 1 && (
             <div className="flowArrow">↓</div>
            )}
          </div>
          ))}
          </div>
          <div className="showcaseBottom">
            <div className="showcaseMessage">
              교과 개념이 실제 탐구보고서로
              <strong> 어떻게 확장되는지 확인하세요.</strong>
            </div>

            <a href={report.href} className="showcaseCTA">
              실제 자료 확인하기
              <span>→</span>
            </a>
          </div>
        </div>
      </article>
    ))}
  </div>
</section>
      <section className="pricingBand" aria-labelledby="one-time-pricing-title">
        <div className="pricingIntro">
          <small>ONE-TIME PAYMENT ONLY</small>
          <h2 id="one-time-pricing-title">월 구독 없이, 필요한 보고서만 건별 결제</h2>
          <p>정기결제와 자동갱신 없이 선택한 자료 1건만 결제합니다.</p>
        </div>

        <div className="priceGrid">
          <article className="priceCard">
  <span>SETEUK</span>
  <h3 style={{ color:"#000000", WebkitTextFillColor:"#000000" }}>
    세특
  </h3>
  <strong>20,000원</strong>
  <p>1건 · 일회성 결제</p>
</article>

<article className="priceCard">
  <span>GENERAL MATERIAL</span>
  <h3 style={{ color:"#000000", WebkitTextFillColor:"#000000" }}>
    일반 자료
  </h3>
  <strong>50,000원</strong>
  <p>1건 · 일회성 결제</p>
</article>

<article className="priceCard premiumPriceCard">
  <span>MINI PAPER</span>
  <h3 style={{ color:"#000000", WebkitTextFillColor:"#000000" }}>
    소논문
  </h3>
  <strong>80,000원</strong>
  <p>1건 · 일회성 결제</p>
</article>
        </div>

        <a className="pricingCta" href="/pricing">건별 요금 자세히 보기</a>
      </section>

      <section className="cycleSection">
        <div className="cycleHead">
          <div>
            <div className="eyebrow">REPORT FLOW</div>
            <h2>탐구의 흐름을 한눈에 보여주는 순환 구조</h2>
          </div>
          <div className="flowStamp">탐구 동기 → 심화 탐구 → 도서 활동 → 느낀점</div>
        </div>

        <div className="cycleImageWrap">
          <img
            src="/images/dharma-inquiry-cycle.png"
            alt="탐구 동기, 심화 탐구, 관련 도서 활동, 느낀점으로 이어지는 탐구의 순환 구조"
            className="cycleImage"
          />
        </div>

        <div className="slogan">
          <strong>“질문에서 시작해 이해를 넓히고, 통찰로 이어지는 탐구의 흐름”</strong>
          <span>과정에 충실한 보고서가 학생의 탐구역량을 증명합니다.</span>
        </div>
      </section>

      <section className="quality">
        <article>
          <small>QUALITY</small>
          <h2>교차검증 완료한 고퀄리티 보고서</h2>
          <p>자료 구성, 과목 연계, 탐구 활용 가능성을 기준으로 검토한 보고서 자료를 제공합니다.</p>
        </article>

        <article>
          <small>RESEARCH REVIEW</small>
          <h2>전문 연구진 검토 완료</h2>
          <p>교과 개념, 탐구 주제, 진로 연계 적합성을 중심으로 검토 절차를 거친 자료를 제공합니다.</p>
        </article>

        <article>
          <small>ORIGINAL FILE</small>
          <h2>원문 파일 다운로드</h2>
          <p>결제 완료 후 Supabase Storage에 등록된 HWP/HWPX/DOCX 원문 파일을 다운로드할 수 있습니다.</p>
        </article>
      </section>

      <section className="care">
        <div>
          <small>CUSTOMER CARE POLICY</small>
          <h2>파일 문제가 있어도 끝까지 책임집니다.</h2>
          <p>
            다운로드 파일에 오류가 있거나 열리지 않는 문제가 발생한 경우,
            고객센터로 문자 연락을 주시면 확인 후 원본 파일 제공을 도와드립니다.
          </p>
        </div>

        <div className="careBox">
          <strong>중요 안내</strong>
          <p>원본 파일 제공 요청은 자료 사용 예정일 기준 최소 3일 전까지 문자로 접수해 주세요.</p>
        </div>
      </section>

      <DharmaBusinessFooter />

      <style>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, #ffffff 0%, #f1f7ff 100%);
          color: #07152f;
          font-family: Arial, sans-serif;
        }

        .header {
          height: 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 5vw;
          border-bottom: 1px solid #d9e7ff;
          background: rgba(255,255,255,.94);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .brand {
          font-size: 22px;
          font-weight: 900;
        }

        .nav {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          font-weight: 900;
        }

        .nav a {
          color: #07152f;
          text-decoration: none;
        }

        .hero,
        .cycleSection,
        .quality,
        .care {
          max-width: 1440px;
          margin: 0 auto;
        }

        .hero {
          padding: 78px 6vw 54px;
        }

        .heroTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 4px;
          font-size: 18px;
          margin-bottom: 22px;
        }

        .heroStatus {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .upgradeClock {
          min-width: 330px;
          padding: 18px 22px;
          border-radius: 24px;
          background: linear-gradient(145deg, #031126 0%, #0b2d5e 100%);
          color: #dff5ff;
          border: 1px solid rgba(126, 210, 255, .34);
          box-shadow: inset 0 0 26px rgba(40, 174, 255, .08), 0 22px 50px rgba(7, 21, 47, .2);
        }

        .upgradeClockTop {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #86d9ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2.4px;
        }

        .upgradeDot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #62e6a7;
          box-shadow: 0 0 14px rgba(98, 230, 167, .9);
          animation: upgradePulse 1.8s ease-in-out infinite;
        }

        .upgradeDigits {
          display: grid;
          grid-template-columns: auto auto auto;
          align-items: end;
          gap: 12px;
          margin-top: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 16px rgba(85, 207, 255, .36);
        }

        .upgradeDate {
          font-size: 17px;
          letter-spacing: 1px;
          color: #a9dff6;
        }

        .upgradeTime {
          font-size: 30px;
          line-height: 1;
          letter-spacing: 2px;
          font-weight: 950;
          color: #ffffff;
        }

        .upgradeZone {
          font-size: 13px;
          font-weight: 950;
          color: #62e6a7;
          padding-bottom: 3px;
        }

        .upgradeClock small {
          display: block;
          margin-top: 10px;
          color: #6faac7;
          letter-spacing: 1.3px;
          font-size: 10px;
          font-weight: 900;
        }

        @keyframes upgradePulse {
          0%, 100% { opacity: .55; transform: scale(.9); }
          50% { opacity: 1; transform: scale(1.12); }
        }

        .verifiedBadge {
          padding: 22px 34px;
          border-radius: 999px;
          background: #e11931;
          color: white;
          font-weight: 950;
          font-size: 28px;
          box-shadow: 0 24px 54px rgba(225,25,49,.32);
          border: 2px solid rgba(255,255,255,.55);
        }

        h1 {
          font-size: clamp(52px, 7vw, 96px);
          line-height: 1.03;
          letter-spacing: -0.065em;
          margin: 12px 0 0;
          font-weight: 950;
        }

        .heroText {
          font-size: 22px;
          line-height: 1.75;
          max-width: 980px;
          margin-top: 30px;
          color: #243d63;
        }

        .actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 34px;
        }

        .primary,
        .ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 28px;
          border-radius: 20px;
          text-decoration: none;
          font-weight: 950;
          font-size: 18px;
        }

        .primary {
          background: #1165e8;
          color: white;
          box-shadow: 0 18px 42px rgba(17,101,232,.28);
        }

        .ghost {
          background: white;
          color: #07152f;
          border: 1px solid #d8e7ff;
        }

        .cards3,
        .quality {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 22px;
          padding: 0 6vw;
        }

        .cards3 {
          padding: 0;
          margin-top: 56px;
        }

        .quality {
          padding-top: 10px;
          padding-bottom: 48px;
        }

        .card,
        .quality article {
          padding: 34px;
          border-radius: 34px;
          background: white;
          border: 1px solid #d8e7ff;
          box-shadow: 0 22px 60px rgba(17,101,232,.10);
        }

        .card span {
          display: inline-flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #e7f1ff;
          color: #1165e8;
          font-weight: 950;
          margin-bottom: 18px;
        }

        .card h2,
        .quality h2 {
          font-size: 30px;
          margin: 0 0 12px;
          letter-spacing: -0.04em;
        }

        .card p,
        .quality p {
          font-size: 18px;
          line-height: 1.7;
          color: #3e5578;
          margin: 0;
        }
        .subjectSection {
  max-width: 1440px;
  margin: 0 auto 34px;
  padding: 44px 6vw;
}

.subjectSectionHead {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.subjectSectionHead h2 {
  margin: 0 0 12px;
  font-size: 44px;
  letter-spacing: -0.04em;
}

.subjectSectionHead p {
  margin: 0;
  color:#3e5578;
  font-size: 18px;
  line-height: 1.7;
}

.allMaterialsLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 20px;
  border-radius: 16px;
  background:#07152f;
  color: white;
  text-decoration: none;
  font-weight: 950;
}

.homeSubjectChips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.homeSubjectChip {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 14px 18px;
  border-radius: 18px;
  background: white;
  border: 1px solid#d8e7ff;
  color:#07152f;
  text-decoration: none;
  box-shadow: 0 10px 28pxrgba(17,101,232,.07);
  transition: .18s ease;
}

.homeSubjectChip:hover {
  transform: translateY(-2px);
  border-color:#1977f3;
  box-shadow: 0 14px 32pxrgba(17,101,232,.14);
}

.homeSubjectChip strong {
  font-weight: 950;
}


  .showcaseSection {
  max-width: 1440px;
  margin: 0 auto;
  padding: 72px 6vw 80px;
}

.showcaseHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 28px;
  margin-bottom: 38px;
}

.showcaseHead h2 {
  margin: 10px 0 16px;
  color: #07152f;
  font-size: clamp(40px, 4.5vw, 66px);
  line-height: 1.06;
  letter-spacing: -0.055em;
}

.showcaseHead h2 span {
  color: #1977f3;
}

.showcaseHead p {
  margin: 0;
  color: #586982;
  font-size: 18px;
  line-height: 1.75;
}

.showcaseAll {
  flex-shrink: 0;
  padding: 14px 19px;
  border-radius: 14px;
  background: #07152f;
  color: white;
  text-decoration: none;
  font-weight: 950;
}

.showcaseList {
  display: grid;
  gap: 32px;
}

.showcaseCard {
  --accent: #1977f3;
  --soft: #eef6ff;

  overflow: hidden;
  padding: 28px;
  border: 1px solid #dce8f6;
  border-radius: 30px;
  background: white;
  box-shadow: 0 18px 60px rgba(17, 54, 101, 0.09);
}

.showcaseCard.blue {
  --accent: #1977f3;
  --soft: #eaf4ff;
}

.showcaseCard.green {
  --accent: #08a779;
  --soft: #e8faf3;
}

.showcaseCard.purple {
  --accent: #7456d8;
  --soft: #f1edff;
}

.showcaseCard.orange {
  --accent: #ef7a24;
  --soft: #fff2e7;
}

.showcaseCard.red {
  --accent: #e94a66;
  --soft: #fff0f3;
}

.showcaseCard.indigo {
  --accent: #4357d6;
  --soft: #eef0ff;
}

.showcaseNumber {
  margin-bottom: 18px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 1000;
  letter-spacing: 0.12em;
}

.showcaseImages {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.showcaseImageBox {
  position: relative;
  overflow: hidden;
  width: min(100%, 760px);
  aspect-ratio: auto;
  border-radius: 20px;
  background: var(--soft);
}

.showcaseImage {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  margin: 0 auto;
}

.showcaseImageNumber {
  position: absolute;
  z-index: 2;
  top: 12px;
  left: 12px;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  background: rgba(7, 21, 47, 0.88);
  color: white;

  font-size: 12px;
  font-weight: 950;
}

.showcaseBody {
  padding-top: 28px;
}

.showcaseSubject {
  display: inline-block;
  margin-bottom: 12px;
  padding: 8px 12px;

  border-radius: 999px;

  background: var(--soft);
  color: var(--accent);

  font-size: 13px;
  font-weight: 950;
}

.showcaseBody h3 {
  max-width: 1050px;
  margin: 0 0 10px;
  color: #07152f;

  font-size: clamp(26px, 3vw, 40px);
  line-height: 1.25;
  letter-spacing: -0.04em;
}

.showcaseSubtitle {
  margin: 0 0 26px;
  color: #5a6c85;
  font-size: 17px;
}

.theoryFlow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.flowStep {
  min-height: 160px;
  padding: 18px;

  border-radius: 18px;
  background: var(--soft);
}

.flowTop {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 13px;
  color: var(--accent);
}

.flowNumber {
  width: 26px;
  height: 26px;

  display: inline-flex;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  background: var(--accent);
  color: white;

  font-size: 11px;
  font-weight: 1000;
}

.flowTop strong {
  font-size: 14px;
}

.flowStep p {
  margin: 0;
  color: #263952;
  font-size: 14px;
  line-height: 1.65;
}

.flowArrow {
  display: none;
}

.showcaseBottom {
  margin-top: 24px;
  padding-top: 20px;

  border-top: 1px solid #e2eaf5;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.showcaseMessage {
  color: #4f6077;
  font-size: 15px;
}

.showcaseMessage strong {
  color: #07152f;
}

.showcaseCTA {
  flex-shrink: 0;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  padding: 14px 18px;

  border-radius: 14px;

  background: var(--accent);
  color: white;

  text-decoration: none;
  font-weight: 1000;
}

.showcaseCTA span {
  font-size: 20px;
}

@media (max-width: 900px) {
  .header {
    padding: 14px 18px;
    align-items: flex-start;
    gap: 12px;
  }

  .brand {
    font-size: 18px;
    line-height: 1.25;
    max-width: 150px;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px 14px;
    font-size: 14px;
  }

  .showcaseSection {
    padding: 34px 16px 48px;
  }

  .showcaseCard {
    padding: 18px;
    border-radius: 22px;
  }

  .showcaseImages {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .showcaseImageBox {
  width: 92%;
  max-width: 520px;
  aspect-ratio: auto;
  margin: 0 auto;
  border-radius: 16px;
}

.showcaseImage {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

  .showcaseBody {
    padding-top: 20px;
  }

  .showcaseBody h3 {
    font-size: 28px;
    line-height: 1.25;
  }

  .showcaseSubtitle {
    font-size: 16px;
    line-height: 1.6;
  }

  .theoryFlow {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .flowStep {
    min-height: auto;
    padding: 16px;
  }

  .showcaseBottom {
    flex-direction: column;
    align-items: stretch;
  }

  .showcaseCTA {
    width: 100%;
    justify-content: center;
  }
}

  .showcaseHead {
    align-items: flex-start;
    flex-direction: column;
  }



  .showcaseImageBox {
    aspect-ratio: 16 / 10;
  }

  .theoryFlow {
    grid-template-columns: 1fr;
  }

  .flowArrow {
    display: block;
    margin-top: 14px;
    color: var(--accent);
    font-weight: 1000;
  }

  .showcaseBottom {
    align-items: flex-start;
    flex-direction: column;
  }
}
        .pricingBand {
          max-width: 1440px;
          margin: 6px auto 28px;
          padding: 40px 6vw;
          display: grid;
          grid-template-columns: 1.1fr 1fr auto;
          align-items: center;
          gap: 24px;
          background: rgba(255,255,255,.82);
          border-top: 1px solid #d8e7ff;
          border-bottom: 1px solid #d8e7ff;
        }

        .pricingIntro small {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 2.8px;
        }

        .pricingIntro h2 {
          margin: 10px 0 10px;
          font-size: 34px;
          letter-spacing: -0.04em;
        }

        .pricingIntro p {
          margin: 0;
          color: #3e5578;
          font-size: 17px;
          line-height: 1.6;
        }

        .priceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .priceCard {
          padding: 22px;
          border-radius: 24px;
          background: #f5f9ff;
          border: 1px solid #d4e5ff;
        }

        .priceCard span {
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 2px;
          color: #1165e8;
        }

        .priceCard h3 {
          margin: 10px 0 8px;
          font-size: 21px;
          letter-spacing: -0.03em;
           color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  font-weight: 900;
        }

        .priceCard strong {
          display: block;
          font-size: 31px;
          letter-spacing: -0.04em;
          color: #1165e8;
        }

        .priceCard p {
          margin: 8px 0 0;
          color: #526784;
          font-size: 14px;
          font-weight: 800;
        }

        .premiumPriceCard {
          background: #fff4f6;
          border-color: #ffd2d9;
        }

        .premiumPriceCard span,
        .premiumPriceCard strong {
          color: #d91d35;
        }

        .pricingCta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 190px;
          padding: 17px 22px;
          border-radius: 18px;
          background: #07152f;
          color: white;
          text-decoration: none;
          font-weight: 950;
        }

        .cycleSection {
          padding: 60px 6vw 76px;
        }

        .cycleHead {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
          flex-wrap: wrap;
        }

        .cycleHead h2 {
          font-size: 48px;
          margin: 0 0 32px;
          letter-spacing: -0.04em;
        }

        .flowStamp {
          padding: 16px 22px;
          border-radius: 22px;
          background: #1165e8;
          color: white;
          font-weight: 950;
          margin-bottom: 32px;
          box-shadow: 0 18px 40px rgba(17,101,232,.22);
        }

        .cycleImageWrap {
          padding: 28px;
          border-radius: 38px;
          background: rgba(255,255,255,.78);
          border: 1px solid #d8e7ff;
          box-shadow: 0 30px 90px rgba(17,101,232,.14);
        }

        .cycleImage {
          width: 100%;
          display: block;
          border-radius: 28px;
        }

        .slogan {
          margin-top: 28px;
          padding: 28px 34px;
          border-radius: 30px;
          background: #07152f;
          color: white;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: center;
          font-size: 20px;
          line-height: 1.6;
          box-shadow: 0 24px 70px rgba(7,21,47,.25);
        }

        .quality small,
        .care small {
          color: #1165e8;
          font-weight: 950;
          letter-spacing: 3px;
          display: block;
          margin-bottom: 10px;
        }

        .care {
          padding: 42px;
          border-radius: 36px;
          background: linear-gradient(135deg, #07152f 0%, #123d81 100%);
          color: white;
          box-shadow: 0 24px 80px rgba(7,21,47,.22);
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 26px;
          margin-bottom: 90px;
        }

        .care h2 {
          font-size: 42px;
          line-height: 1.15;
          margin: 0 0 18px;
          letter-spacing: -0.04em;
        }

        .care p {
          font-size: 20px;
          line-height: 1.75;
          margin: 0;
          color: #dcecff;
        }

        .careBox {
          padding: 28px;
          border-radius: 26px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.22);
        }

        .careBox strong {
          display: block;
          font-size: 24px;
          margin-bottom: 12px;
        }

        @media (max-width: 900px) {
          .cards3,
          .quality,
          .care,
          .pricingBand {
            grid-template-columns: 1fr;
          }

          .heroStatus {
            width: 100%;
            justify-content: flex-start;
          }

          .upgradeClock {
            min-width: 0;
            width: 100%;
          }

          .upgradeDigits {
            grid-template-columns: 1fr auto;
          }

          .upgradeDate {
            grid-column: 1 / -1;
          }

          .priceGrid {
            grid-template-columns: 1fr;
          }

          .cycleHead h2 {
            font-size: 36px;
          }

          .verifiedBadge {
            font-size: 22px;
            padding: 18px 26px;
          }

          .cycleImageWrap {
            padding: 12px;
          }
        }
      `}</style>
    </main>
  );
}
