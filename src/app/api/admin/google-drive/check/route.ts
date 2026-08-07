import { NextRequest, NextResponse } from "next/server";
import { compareFingerprints, createFingerprints, readKnowledgeBaseCache } from "@/lib/kb-storage";
import { getDriveScopeDescription, listDriveFilesWithAccessToken } from "@/lib/google-drive-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("dharma_google_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        code: "GOOGLE_DRIVE_NOT_CONNECTED",
        message: "Google Drive가 아직 연결되지 않았습니다.",
        next: "/api/auth/google/login",
      },
      { status: 401 }
    );
  }

  try {
    const files = await listDriveFilesWithAccessToken(accessToken);
    const currentFingerprints = createFingerprints(files);
    const cache = await readKnowledgeBaseCache();

    if (!cache) {
      return NextResponse.json({
        ok: true,
        connected: true,
        hasUpdates: true,
        message: "아직 동기화된 Knowledge Base가 없습니다. 최초 동기화가 필요합니다.",
        newCount: currentFingerprints.length,
        updatedCount: 0,
        deletedCount: 0,
        driveCount: currentFingerprints.length,
        cachedCount: 0,
        driveScope: getDriveScopeDescription(),
      });
    }

    const diff = compareFingerprints(currentFingerprints, cache.fingerprints);

    return NextResponse.json({
      ok: true,
      connected: true,
      ...diff,
      driveCount: currentFingerprints.length,
      cachedCount: cache.items.length,
      excludedFileCount: cache.excludedFileCount ?? 0,
      lastSyncedAt: cache.syncedAt,
      driveScope: getDriveScopeDescription(),
      message: diff.hasUpdates ? "Google Drive에 변경사항이 있습니다. 동기화가 필요합니다." : "Knowledge Base가 최신 상태입니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "GOOGLE_DRIVE_CHECK_FAILED",
        message: error instanceof Error ? error.message : "Google Drive 변경 확인 실패",
        help: "Google Drive 연결 상태, GOOGLE_DRIVE_FOLDER_ID, OAuth 권한을 확인하세요.",
      },
      { status: 500 }
    );
  }
}
