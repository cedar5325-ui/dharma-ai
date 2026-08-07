import { decryptText, encryptText } from "@/lib/token-crypto";
import { isSupabaseReady, supabaseRest } from "@/lib/supabase-rest";
import { getGoogleOAuthConfig } from "@/lib/google-drive-oauth";

type GoogleTokenPayload = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

type StoredGoogleConnection = {
  id: string;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
  scope: string | null;
  token_type: string | null;
  updated_at?: string | null;
};

export function cloudConnectionId() {
  return process.env.GOOGLE_CONNECTION_ID || "dharma_admin_drive";
}

export function isCloudTokenStoreReady() {
  return isSupabaseReady() && Boolean(process.env.TOKEN_ENCRYPTION_KEY);
}

export async function readGoogleConnection(): Promise<StoredGoogleConnection | null> {
  if (!isCloudTokenStoreReady()) return null;
  const data = await supabaseRest(`dharma_google_oauth?id=eq.${encodeURIComponent(cloudConnectionId())}&select=*`);
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function saveGoogleTokensToCloud(tokens: GoogleTokenPayload) {
  if (!isCloudTokenStoreReady()) {
    return { ok: false, message: "클라우드 토큰 저장소 환경변수가 아직 없습니다." };
  }

  const previous = await readGoogleConnection();
  const refreshToken = tokens.refresh_token || (previous?.refresh_token ? decryptText(previous.refresh_token) : "");
  const expiresAt = Date.now() + Math.max(60, Number(tokens.expires_in || 3600) - 60) * 1000;

  const row = {
    id: cloudConnectionId(),
    access_token: encryptText(tokens.access_token),
    refresh_token: refreshToken ? encryptText(refreshToken) : null,
    expires_at: expiresAt,
    scope: tokens.scope || previous?.scope || "",
    token_type: tokens.token_type || previous?.token_type || "Bearer",
    updated_at: new Date().toISOString(),
  };

  const saved = await supabaseRest("dharma_google_oauth", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row),
  });

  return { ok: true, row: Array.isArray(saved) ? saved[0] : saved };
}

async function refreshGoogleAccessToken(refreshToken: string) {
  const config = getGoogleOAuthConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || "Google access token refresh 실패");
  await saveGoogleTokensToCloud({ ...data, refresh_token: refreshToken });
  return data.access_token as string;
}

export async function getStoredGoogleAccessToken() {
  const record = await readGoogleConnection();
  if (!record?.access_token) return "";

  const expiresAt = Number(record.expires_at || 0);
  if (expiresAt > Date.now() + 60_000) return decryptText(record.access_token);

  if (!record.refresh_token) return decryptText(record.access_token);
  return refreshGoogleAccessToken(decryptText(record.refresh_token));
}

export async function getCloudGoogleConnectionStatus() {
  if (!isCloudTokenStoreReady()) {
    return {
      cloudReady: false,
      connected: false,
      message: "클라우드 토큰 저장소 환경변수가 아직 설정되지 않았습니다.",
    };
  }
  const record = await readGoogleConnection();
  return {
    cloudReady: true,
    connected: Boolean(record?.refresh_token || record?.access_token),
    updatedAt: record?.updated_at || null,
    expiresAt: record?.expires_at || null,
    message: record ? "Google Drive 연결 정보가 클라우드 DB에 저장되어 있습니다." : "저장된 Google Drive 연결 정보가 없습니다.",
  };
}
