import { NextResponse } from "next/server";
import { createGoogleAuthUrl } from "@/lib/google-drive-oauth";

export async function GET() {
  try {
    const url = createGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Google OAuth URL 생성 실패",
        help: ".env.local에 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI를 설정하세요.",
      },
      { status: 500 }
    );
  }
}
