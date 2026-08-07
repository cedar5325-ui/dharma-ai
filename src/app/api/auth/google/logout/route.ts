import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/google-drive?disconnected=1", request.url));

  response.cookies.delete("dharma_google_access_token");
  response.cookies.delete("dharma_google_refresh_token");

  return response;
}
