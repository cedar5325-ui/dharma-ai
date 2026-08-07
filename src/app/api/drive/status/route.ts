import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthConfig, isGoogleOAuthReady } from "@/lib/google-drive-oauth";
import { getCloudGoogleConnectionStatus } from "@/lib/google-cloud-token-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const config = getGoogleOAuthConfig();
  const cookieConnected = Boolean(request.cookies.get("dharma_google_access_token")?.value);
  const cloud = await getCloudGoogleConnectionStatus();

  return NextResponse.json({
    ready: isGoogleOAuthReady(),
    connected: cookieConnected || cloud.connected,
    authType: "OAuth 2.0",
    cloudTokenStore: cloud,
    folderIdConfigured: Boolean(config.folderId),
    message: cookieConnected || cloud.connected
      ? "Google OAuth 설정과 Drive 연결이 완료되었습니다."
      : "Google OAuth 설정은 완료되었습니다. Google 계정 연결이 필요합니다.",
  });
}
