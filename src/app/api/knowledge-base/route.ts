import { NextResponse } from "next/server";
import { readKnowledgeBaseCache } from "@/lib/kb-storage";

export const runtime = "nodejs";

export async function GET() {
  const cache = await readKnowledgeBaseCache();

  if (!cache) {
    return NextResponse.json(
      {
        ok: false,
        message: "아직 동기화된 Knowledge Base가 없습니다. 관리자 페이지에서 Google Drive 동기화를 먼저 실행하세요.",
        next: "/admin/google-drive",
        items: [],
        summary: { total: 0, subjects: 0, sourceTypes: 0, advanced: 0 },
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ok: true,
    summary: cache.summary,
    items: cache.items,
    syncedAt: cache.syncedAt,
    exposurePolicy: cache.exposurePolicy,
    rule: "Drive 자료는 원문 그대로 출력하지 않고 분석·검증·재구성의 근거로만 사용합니다.",
  });
}
