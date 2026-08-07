import { NextRequest, NextResponse } from "next/server";
import { filterAndClassifyKnowledgeBase, toPublicKnowledgeBase } from "@/lib/kb-classifier";
import { listDriveFilesWithAccessToken } from "@/lib/google-drive-oauth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("dharma_google_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        ok: false,
        message: "Google Drive가 아직 연결되지 않았습니다.",
        next: "/api/auth/google/login",
      },
      { status: 401 }
    );
  }

  try {
    const files = await listDriveFilesWithAccessToken(accessToken);
    const internalItems = filterAndClassifyKnowledgeBase(files);
    const publicItems = toPublicKnowledgeBase(internalItems);

    return NextResponse.json({
      ok: true,
      count: publicItems.length,
      lastSyncedAt: new Date().toISOString(),
      items: publicItems,
      exposurePolicy: {
        fileNames: "hidden",
        fileContents: "hidden",
        driveLinks: "hidden",
        rule: "고객 화면과 API 응답에는 원본 파일명, 원문 내용, Drive 링크를 노출하지 않습니다.",
      },
      rule: "Google Drive 자료는 그대로 출력하지 않고 분석·검증·재구성합니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Google Drive 동기화 실패",
      },
      { status: 500 }
    );
  }
}
