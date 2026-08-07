import { google } from "googleapis";

export type DriveFile = {
  id: string;
  name: string;
  mimeType?: string | null;
  modifiedTime?: string | null;
  webViewLink?: string | null;
};

export function getGoogleDriveClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Google Drive API 환경변수가 설정되지 않았습니다.");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

export async function listDriveFiles(): Promise<DriveFile[]> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) throw new Error("GOOGLE_DRIVE_FOLDER_ID가 설정되지 않았습니다.");

  const drive = getGoogleDriveClient();
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, modifiedTime, webViewLink)",
    orderBy: "modifiedTime desc",
    pageSize: 50,
  });

  return (response.data.files || []).map((file) => ({
    id: file.id || "",
    name: file.name || "이름 없음",
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime,
    webViewLink: file.webViewLink,
  }));
}

export function classifyDriveFile(file: DriveFile) {
  const name = file.name.toLowerCase();
  let subject = "미분류";
  if (name.includes("생명") || name.includes("면역") || name.includes("dna")) subject = "생명과학";
  if (name.includes("화학") || name.includes("반응")) subject = "화학";
  if (name.includes("수학") || name.includes("모델")) subject = "수학";
  if (name.includes("물리") || name.includes("에너지")) subject = "물리";

  let type = "자료";
  if (name.endsWith(".pdf")) type = "PDF";
  if (name.endsWith(".docx")) type = "문서";
  if (name.endsWith(".xlsx")) type = "데이터";
  if (name.endsWith(".pptx")) type = "슬라이드";

  return { ...file, subject, type, policy: "원자료 그대로 사용 금지 · 분석 후 재구성" };
}
