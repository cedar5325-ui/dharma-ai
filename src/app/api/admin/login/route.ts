import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dharma_admin_session";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        {
          ok: false,
          message: "ADMIN_PASSWORD가 .env.local에 설정되지 않았습니다.",
        },
        { status: 500 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        {
          ok: false,
          message: "관리자 비밀번호가 올바르지 않습니다.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: "관리자 인증이 완료되었습니다.",
    });

    response.cookies.set(ADMIN_COOKIE_NAME, "authorized", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "관리자 로그인 요청을 처리하지 못했습니다.",
      },
      { status: 400 }
    );
  }
}
