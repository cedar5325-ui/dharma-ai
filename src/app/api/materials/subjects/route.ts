import { NextRequest, NextResponse } from "next/server";
import { listMaterials } from "@/lib/material-catalog";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("dharma_google_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      {
        ok: false,
        message: "Google Drive 연결이 필요합니다.",
        next: "/api/auth/google/login",
      },
      { status: 401 }
    );
  }

  try {
    const materials = await listMaterials(accessToken);
    const subjectMap = new Map<string, number>();

    for (const item of materials) {
      subjectMap.set(item.subject, (subjectMap.get(item.subject) || 0) + 1);
    }

    const subjects = Array.from(subjectMap.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => a.subject.localeCompare(b.subject, "ko"));

    return NextResponse.json({
      ok: true,
      subjects,
      total: materials.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "과목 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}
