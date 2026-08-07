import type { NextRequest } from "next/server";
import { getStoredGoogleAccessToken } from "@/lib/google-cloud-token-store";

export async function getGoogleAccessTokenFromRequest(request: NextRequest) {
  const cookieToken = request.cookies.get("dharma_google_access_token")?.value;
  if (cookieToken) return cookieToken;
  return getStoredGoogleAccessToken();
}
