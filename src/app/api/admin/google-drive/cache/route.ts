import { NextResponse } from "next/server";
import { readKnowledgeBaseCache } from "@/lib/kb-storage";

export const runtime = "nodejs";

export async function GET() {
  const cache = await readKnowledgeBaseCache();

  if (!cache) {
    return NextResponse.json({
      ok: false,
      message: "아직 동기화된 Knowledge Base가 없습니다.",
      summary: { total: 0, subjects: 0, sourceTypes: 0, advanced: 0 },
      items: [],
      syncedAt: null,
      driveFileCount: 0,
      excludedFileCount: 0,
    });
  }

  return NextResponse.json({
    ok: true,
    syncedAt: cache.syncedAt,
    driveFileCount: cache.driveFileCount ?? cache.fingerprints.length,
    excludedFileCount: cache.excludedFileCount ?? 0,
    summary: cache.summary,
    items: cache.items,
    exposurePolicy: cache.exposurePolicy,
  });
}
