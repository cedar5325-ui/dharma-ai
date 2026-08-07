export type GoogleDriveFile = {
  id: string;
  name: string;
  mimeType?: string | null;
  modifiedTime?: string | null;
  webViewLink?: string | null;
  size?: string | null;
  parents?: string[] | null;
};

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";

export function getGoogleOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:3000/api/auth/google/callback",
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  };
}

export function isGoogleOAuthReady() {
  const config = getGoogleOAuthConfig();
  return Boolean(config.clientId && config.clientSecret && config.redirectUri);
}

export function getGoogleAuthUrl() {
  const config = getGoogleOAuthConfig();

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ].join(" "),
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function createGoogleAuthUrl() {
  return getGoogleAuthUrl();
}

export async function exchangeCodeForTokens(code: string) {
  const config = getGoogleOAuthConfig();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Google OAuth token exchange failed");
  }

  return data as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  };
}

export async function getTokensFromCode(code: string) {
  return exchangeCodeForTokens(code);
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/'/g, "\\'");
}

async function listDriveFilesByQuery(accessToken: string, query: string): Promise<GoogleDriveFile[]> {
  const files: GoogleDriveFile[] = [];
  let pageToken: string | undefined = undefined;
  let safetyPageCount = 0;

  do {
    safetyPageCount += 1;

    if (safetyPageCount > 100) {
      throw new Error("Google Drive 페이지 조회가 비정상적으로 반복되어 중단했습니다.");
    }

    const params = new URLSearchParams({
      q: query,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, size, parents)",
      orderBy: "modifiedTime desc",
      pageSize: "1000",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const response = await fetch(`${GOOGLE_DRIVE_FILES_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      const googleMessage = data.error?.message || data.error_description || data.error;
      throw new Error(googleMessage || "Google Drive 파일 목록을 불러오지 못했습니다.");
    }

    if (Array.isArray(data.files)) {
      files.push(...data.files);
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

async function listDirectChildren(accessToken: string, folderId: string) {
  const safeFolderId = escapeDriveQueryValue(folderId);
  return listDriveFilesByQuery(
    accessToken,
    `trashed = false and '${safeFolderId}' in parents`
  );
}

async function listFolderTreeFiles(accessToken: string, rootFolderId: string) {
  const queue = [rootFolderId];
  const visitedFolders = new Set<string>();
  const allFiles: GoogleDriveFile[] = [];
  let safetyFolderCount = 0;

  while (queue.length > 0) {
    const folderId = queue.shift()!;

    if (visitedFolders.has(folderId)) continue;
    visitedFolders.add(folderId);

    safetyFolderCount += 1;

    if (safetyFolderCount > 1000) {
      throw new Error("하위 폴더가 너무 많아 조회를 중단했습니다. 전용 폴더를 더 작게 나누어 주세요.");
    }

    const children = await listDirectChildren(accessToken, folderId);

    for (const child of children) {
      if (child.mimeType === GOOGLE_FOLDER_MIME) {
        queue.push(child.id);
      } else {
        allFiles.push(child);
      }
    }
  }

  return allFiles;
}

export async function listDriveFilesWithAccessToken(accessToken: string): Promise<GoogleDriveFile[]> {
  const config = getGoogleOAuthConfig();

  if (config.folderId) {
    return listFolderTreeFiles(accessToken, config.folderId);
  }

  return listDriveFilesByQuery(accessToken, "trashed = false");
}

export function getDriveScopeDescription() {
  const config = getGoogleOAuthConfig();

  if (config.folderId) {
    return {
      scope: "folder_recursive",
      message:
        "GOOGLE_DRIVE_FOLDER_ID가 설정되어 있어 해당 폴더와 모든 하위 폴더 안의 파일을 재귀적으로 동기화합니다.",
      folderId: config.folderId,
    };
  }

  return {
    scope: "all",
    message:
      "GOOGLE_DRIVE_FOLDER_ID가 비어 있어 연결된 Google Drive의 접근 가능한 파일을 동기화합니다.",
    folderId: "",
  };
}
