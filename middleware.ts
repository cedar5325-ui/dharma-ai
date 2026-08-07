import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dharma_admin_session";

function isPublicAdminAuthPath(pathname: string) {
  return (
    pathname === "/admin-login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  );
}

function isProtectedAdminPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 관리자 로그인 화면과 로그인/로그아웃 API는 인증 전에 접근 가능해야 합니다.
  if (isPublicAdminAuthPath(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next();
  }

  const adminSession = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (adminSession === "authorized") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        ok: false,
        message: "관리자 인증이 필요합니다.",
        next: "/admin-login",
      },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin-login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
