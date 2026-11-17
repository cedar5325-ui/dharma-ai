import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseUrl() {
  return String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export async function GET() {
  try {
    const url = getSupabaseUrl();
    const key = getServiceKey();

    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다."
      );
    }

    const subjectMap = new Map<string, number>();

    const PAGE_SIZE = 1000;
    let from = 0;

    while (true) {
      const to = from + PAGE_SIZE - 1;

      const response = await fetch(
        `${url}/rest/v1/dharma_materials?select=subject`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Range: `${from}-${to}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `과목 목록 조회 실패: ${response.status} ${errorText}`
        );
      }

      const rows = await response.json();

      if (!Array.isArray(rows)) {
        break;
      }

      for (const row of rows) {
        const subject = String(row?.subject || "").trim();

        if (!subject) continue;

        subjectMap.set(
          subject,
          (subjectMap.get(subject) || 0) + 1
        );
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      from += PAGE_SIZE;
    }

    const subjects = Array.from(subjectMap.entries())
      .map(([subject, count]) => ({
        subject,
        count,
      }))
      .sort((a, b) =>
        a.subject.localeCompare(b.subject, "ko")
      );

    const total = Array.from(subjectMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    return NextResponse.json({
      ok: true,
      subjects,
      total,
    });
  } catch (error) {
    console.error("과목 목록 조회 오류:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "과목 목록을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }
}