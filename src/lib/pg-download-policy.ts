import { NextResponse } from "next/server";

function envFlag(name: string, defaultValue = false) {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  return raw.trim().toLowerCase() === "true";
}

/**
 * PG사 최종 승인 여부입니다.
 *
 * false:
 *   모바일·PC 모두 자료 검색과 상세 열람만 가능하며 원문 다운로드는 전면 차단합니다.
 *
 * true:
 *   이 사전 차단만 해제합니다. 실제 다운로드 허용 여부는 기존 다운로드 API의
 *   결제·구매 완료 검증 로직이 계속 판단해야 합니다.
 */
export function isDharmaPgApproved() {
  return envFlag("DHARMA_PG_APPROVED", false);
}

/**
 * 테스트 구매 완료 API는 기본적으로 비활성화합니다.
 * production에서는 환경변수와 관계없이 항상 비활성화됩니다.
 */
export function isDharmaTestPurchaseEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    envFlag("DHARMA_TEST_PURCHASE_ENABLED", false)
  );
}

function noStoreHeaders(policy: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Vary: "Accept",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "X-DHARMA-Download-Policy": policy,
  };
}

function requestPrefersHtml(request: Request) {
  const accepts = request.headers.get("accept") ?? "";
  const mode = request.headers.get("sec-fetch-mode") ?? "";
  return accepts.includes("text/html") || mode === "navigate";
}

function pgPendingHtml() {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>자료 다운로드 준비 중 | 다르마(DHARMA) AI</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #f4f8ff;
      color: #071a3d;
      font-family: Pretendard, "Noto Sans KR", Arial, sans-serif;
    }
    main {
      width: min(640px, 100%);
      padding: 38px;
      border: 1px solid #d8e5ff;
      border-radius: 24px;
      background: #fff;
      box-shadow: 0 18px 50px rgba(15, 50, 110, .12);
      text-align: center;
    }
    .eyebrow {
      margin: 0 0 12px;
      color: #1264e8;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .14em;
    }
    h1 {
      margin: 0 0 16px;
      font-size: clamp(28px, 7vw, 40px);
      line-height: 1.2;
    }
    p {
      margin: 0;
      color: #4b5e7a;
      font-size: 17px;
      line-height: 1.75;
    }
    .notice {
      margin-top: 22px;
      padding: 16px;
      border-radius: 16px;
      background: #eef5ff;
      color: #24466f;
      font-size: 15px;
      line-height: 1.65;
    }
    a {
      display: inline-flex;
      margin-top: 24px;
      min-height: 48px;
      align-items: center;
      justify-content: center;
      padding: 0 22px;
      border-radius: 14px;
      background: #146cf2;
      color: #fff;
      font-weight: 800;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">DHARMA AI NOTICE</p>
    <h1>현재 원문 다운로드를 제공하지 않습니다</h1>
    <p>PG사 승인 전에는 모바일과 PC에서 자료 검색과 상세 열람만 가능합니다.</p>
    <div class="notice">PG사 승인 후에도 결제가 완료되고 구매내역이 확인된 자료만 다운로드할 수 있습니다.</div>
    <a href="/materials">자료 목록으로 돌아가기</a>
  </main>
</body>
</html>`;
}

/**
 * 다운로드 API의 가장 앞에서 호출합니다.
 *
 * PG 승인 전: 모든 기기·모든 브라우저에서 403으로 차단합니다.
 * PG 승인 후: null을 반환하여 기존 결제·구매 검증 로직으로 계속 진행합니다.
 *
 * 이 함수는 결제를 대신 검증하지 않으며, 승인 후에도 다운로드를 직접 허용하지 않습니다.
 */
export function enforcePgApprovalBeforeDownload(request: Request) {
  if (isDharmaPgApproved()) {
    return null;
  }

  const headers = noStoreHeaders("pg-not-approved-download-blocked");

  if (requestPrefersHtml(request)) {
    return new NextResponse(pgPendingHtml(), {
      status: 403,
      headers: {
        ...headers,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  return NextResponse.json(
    {
      ok: false,
      code: "DOWNLOAD_BLOCKED_PG_NOT_APPROVED",
      title: "자료 다운로드 제한",
      message:
        "현재 PG사 승인 전으로 모바일과 PC에서 원문 파일을 다운로드할 수 없습니다.",
      materialSearchAllowed: true,
      materialDetailAllowed: true,
      materialDownloadAllowed: false,
      paymentRequiredAfterPgApproval: true,
    },
    {
      status: 403,
      headers,
    },
  );
}

/**
 * 테스트 구매 완료 엔드포인트 앞에서 호출합니다.
 * 운영 환경에서는 항상 차단되며, 로컬 개발에서도 명시적으로 true를 설정한 경우에만 열립니다.
 */
export function enforceTestPurchasePolicy(request?: Request) {
  if (isDharmaTestPurchaseEnabled()) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      code: "TEST_PURCHASE_DISABLED",
      message:
        "테스트 구매 완료 기능은 비활성화되어 있습니다. 실제 PG 결제 승인과 구매내역 검증을 사용하세요.",
    },
    {
      status: 404,
      headers: noStoreHeaders("test-purchase-disabled"),
    },
  );
}
