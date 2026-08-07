import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return response();
}

export async function POST() {
  return response();
}

function response() {
  return NextResponse.json({
    ok: true,
    disabled: true,
    message:
      "Storage 동기화는 원래 한글 파일명을 숫자 저장명으로 덮어쓸 수 있어 비활성화했습니다. /admin/storage의 '선택 파일 순차 업로드'만 사용하세요.",
  });
}
