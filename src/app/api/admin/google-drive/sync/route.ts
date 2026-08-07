import { NextRequest, NextResponse } from "next/server";
import { filterAndClassifyKnowledgeBase, shouldExcludeDriveFile, toPublicKnowledgeBase } from "@/lib/kb-classifier";
import { createFingerprints, writeKnowledgeBaseCache } from "@/lib/kb-storage";
import { getDriveScopeDescription, listDriveFilesWithAccessToken } from "@/lib/google-drive-oauth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("dharma_google_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        ok: false,
        code: "GOOGLE_DRIVE_NOT_CONNECTED",
        message: "Google Drive가 아직 연결되지 않았습니다.",
        next: "/api/auth/google/login",
      },
      { status: 401 }
    );
  }

  try {
    const startedAt = Date.now();
    const files = await listDriveFilesWithAccessToken(accessToken);
    const excludedFileCount = files.filter(shouldExcludeDriveFile).length;
    const internalItems = filterAndClassifyKnowledgeBase(files);
    const publicItems = toPublicKnowledgeBase(internalItems);
    const fingerprints = createFingerprints(files);
    const cache = await writeKnowledgeBaseCache(publicItems, fingerprints, {
      driveFileCount: files.length,
      excludedFileCount,
    });

    return NextResponse.json({
      ok: true,
      message: "Google Drive 동기화가 완료되었습니다.",
      syncedAt: cache.syncedAt,
      durationMs: Date.now() - startedAt,
      driveScope: getDriveScopeDescription(),
      driveFileCount: files.length,
      excludedFileCount,
      publicItemCount: publicItems.length,
      summary: cache.summary,
      items: cache.items,
      exposurePolicy: cache.exposurePolicy,
      notice: "동기화 수치는 Google Drive 전체 조회 수와 고객 화면 공개 메타데이터 수를 구분합니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "GOOGLE_DRIVE_SYNC_FAILED",
        message: error instanceof Error ? error.message : "Google Drive 동기화 실패",
        help: "Google Drive 연결 상태, GOOGLE_DRIVE_FOLDER_ID, OAuth 권한을 확인하세요.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
