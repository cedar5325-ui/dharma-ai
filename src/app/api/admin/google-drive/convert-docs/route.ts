import { NextRequest, NextResponse } from "next/server";
import { convertDriveFilesToGoogleDocs } from "@/lib/google-drive-converter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
    const body = await request.json().catch(() => ({}));

    const result = await convertDriveFilesToGoogleDocs(accessToken, {
      dryRun: Boolean(body.dryRun),
      limit: Number(body.limit || 100),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Google Docs 변환 실패",
        help: "쓰기 권한이 필요합니다. Google Drive 연결을 다시 진행하고 권한을 모두 허용해 주세요.",
      },
      { status: 500 }
    );
  }
}
