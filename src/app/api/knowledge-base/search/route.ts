import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeBaseIndex } from "@/lib/kb-indexer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await searchKnowledgeBaseIndex({
      ...(body.input || body || {}),
      limit: Number(body.limit || 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Knowledge Base 검색 실패" },
      { status: 500 }
    );
  }
}
