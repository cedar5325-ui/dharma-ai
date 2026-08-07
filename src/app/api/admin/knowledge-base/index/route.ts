import { NextRequest, NextResponse } from "next/server";
import { buildKnowledgeBaseIndex, getKnowledgeBaseIndexStatus } from "@/lib/kb-indexer";
import { getGoogleAccessTokenFromRequest } from "@/lib/google-access-token";

export const runtime = "nodejs";

export async function GET() {
  const status = await getKnowledgeBaseIndexStatus();
  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  const accessToken = await getGoogleAccessTokenFromRequest(request);
  if (!accessToken) return NextResponse.json({ ok: false, message: "Google Drive 연결이 필요합니다.", next: "/api/auth/google/login" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = await buildKnowledgeBaseIndex(accessToken, { limit: Number(body.limit || 300), mode: body.mode === "rebuild" ? "rebuild" : "incremental" });
  return NextResponse.json(result);
}
