import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dharma_admin_session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
