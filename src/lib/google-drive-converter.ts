import { getGoogleOAuthConfig, listDriveFilesWithAccessToken, type GoogleDriveFile } from "@/lib/google-drive-oauth";

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";

type ConvertResult = {
  sourceId: string;
  sourceName: string;
  sourceMimeType: string;
  status: "converted" | "skipped" | "failed" | "would_convert";
  reason?: string;
  newFileId?: string;
  newFileName?: string;
  webViewLink?: string;
};

const SUPPORTED_EXTENSIONS = [
  ".doc",
  ".docx",
  ".odt",
  ".rtf",
  ".txt",
  ".html",
  ".htm",
  ".pdf",
  ".csv",
  ".md",
];

const SUPPORTED_MIME_PATTERNS = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/rtf",
  "text/plain",
  "text/html",
  "text/markdown",
  "text/csv",
  "application/pdf",
];

function stripExtension(name: string) {
  return name.replace(/\.[^/.]+$/, "");
}

function hasSupportedExtension(name: string) {
  const lower = name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function isConvertible(file: GoogleDriveFile) {
  const mimeType = file.mimeType || "";
  const name = file.name || "";

  if (mimeType === GOOGLE_DOC_MIME) return { ok: false, reason: "이미 Google Docs 파일입니다." };
  if (mimeType === GOOGLE_FOLDER_MIME) return { ok: false, reason: "폴더는 변환하지 않습니다." };
  if (mimeType.startsWith("application/vnd.google-apps.")) {
    return { ok: false, reason: "Google Workspace 기본 파일은 변환 대상에서 제외했습니다." };
  }
  if (name.includes("러셀광주근태관리")) return { ok: false, reason: "제외 규칙에 해당하는 내부 파일입니다." };
  if (name.includes("(Google Docs 변환본)")) return { ok: false, reason: "이미 변환본으로 보이는 파일입니다." };

  const supportedMime = SUPPORTED_MIME_PATTERNS.some((pattern) => mimeType.includes(pattern));
  const supportedExt = hasSupportedExtension(name);

  if (!supportedMime && !supportedExt) {
    return {
      ok: false,
      reason: "Google Docs 변환 지원 여부가 불확실한 형식입니다. HWPX/DOCX/PDF는 Google Docs로 직접 열어 변환하거나 Google Docs 형식으로 다시 저장하는 것이 안전합니다.",
    };
  }

  return { ok: true, reason: "" };
}

async function downloadFile(accessToken: string, fileId: string) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.text();
    throw new Error(data || "파일 다운로드 실패");
  }

  return Buffer.from(await response.arrayBuffer());
}

function buildMultipartBody(metadata: Record<string, unknown>, media: Buffer, sourceMimeType: string) {
  const boundary = `dharma_boundary_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const metadataPart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n`;

  const mediaHeader =
    `--${boundary}\r\n` +
    `Content-Type: ${sourceMimeType || "application/octet-stream"}\r\n\r\n`;

  const closing = `\r\n--${boundary}--`;

  const body = Buffer.concat([
    Buffer.from(metadataPart, "utf-8"),
    Buffer.from(mediaHeader, "utf-8"),
    media,
    Buffer.from(closing, "utf-8"),
  ]);

  return { boundary, body };
}

async function uploadAsGoogleDoc(accessToken: string, file: GoogleDriveFile) {
  const config = getGoogleOAuthConfig();
  const media = await downloadFile(accessToken, file.id);

  const parent =
    config.folderId ||
    (Array.isArray(file.parents) && file.parents.length > 0 ? file.parents[0] : undefined);

  const metadata: Record<string, unknown> = {
    name: `${stripExtension(file.name)} (Google Docs 변환본)`,
    mimeType: GOOGLE_DOC_MIME,
  };

  if (parent) {
    metadata.parents = [parent];
  }

  const { boundary, body } = buildMultipartBody(metadata, media, file.mimeType || "application/octet-stream");

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Google Docs 변환 업로드 실패");
  }

  return data as {
    id: string;
    name: string;
    webViewLink?: string;
  };
}

export async function convertDriveFilesToGoogleDocs(
  accessToken: string,
  options?: {
    dryRun?: boolean;
    limit?: number;
  }
) {
  const dryRun = Boolean(options?.dryRun);
  const limit = options?.limit && options.limit > 0 ? options.limit : 100;

  const files = await listDriveFilesWithAccessToken(accessToken);
  const existingNames = new Set(files.map((file) => file.name));
  const results: ConvertResult[] = [];

  for (const file of files.slice(0, limit)) {
    const sourceMimeType = file.mimeType || "";
    const check = isConvertible(file);

    if (!check.ok) {
      results.push({
        sourceId: file.id,
        sourceName: file.name,
        sourceMimeType,
        status: "skipped",
        reason: check.reason,
      });
      continue;
    }

    const targetName = `${stripExtension(file.name)} (Google Docs 변환본)`;

    if (existingNames.has(targetName)) {
      results.push({
        sourceId: file.id,
        sourceName: file.name,
        sourceMimeType,
        status: "skipped",
        reason: "동일한 이름의 변환본이 이미 있습니다.",
        newFileName: targetName,
      });
      continue;
    }

    if (dryRun) {
      results.push({
        sourceId: file.id,
        sourceName: file.name,
        sourceMimeType,
        status: "would_convert",
        reason: "변환 가능 대상으로 확인되었습니다.",
        newFileName: targetName,
      });
      continue;
    }

    try {
      const created = await uploadAsGoogleDoc(accessToken, file);
      results.push({
        sourceId: file.id,
        sourceName: file.name,
        sourceMimeType,
        status: "converted",
        reason: "Google Docs 변환본을 생성했습니다.",
        newFileId: created.id,
        newFileName: created.name,
        webViewLink: created.webViewLink,
      });
    } catch (error) {
      results.push({
        sourceId: file.id,
        sourceName: file.name,
        sourceMimeType,
        status: "failed",
        reason: error instanceof Error ? error.message : "변환 실패",
      });
    }
  }

  const summary = {
    totalScanned: results.length,
    wouldConvert: results.filter((item) => item.status === "would_convert").length,
    converted: results.filter((item) => item.status === "converted").length,
    skipped: results.filter((item) => item.status === "skipped").length,
    failed: results.filter((item) => item.status === "failed").length,
  };

  return {
    ok: true,
    dryRun,
    summary,
    results,
    rule: "원본 파일은 삭제하지 않고 Google Docs 변환본을 새로 생성합니다.",
  };
}
