import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-drive-oauth";
import { saveGoogleTokensToCloud } from "@/lib/google-cloud-token-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ ok: false, message: "Google OAuth code가 없습니다." }, { status: 400 });

  try {
    const tokens = await getTokensFromCode(code);
    const saved = await saveGoogleTokensToCloud(tokens);

    const redirectUrl = new URL("/admin/google-drive?connected=1&cloud=1", request.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set("dharma_google_access_token", tokens.access_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(60, Number(tokens.expires_in || 3600) - 60),
    });

    response.cookies.set("dharma_google_connected", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("dharma_google_cloud_saved", saved.ok ? "1" : "0", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Google OAuth callback 실패" },
      { status: 500 }
    );
  }
}
