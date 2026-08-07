import { NextRequest, NextResponse } from "next/server";
import { generateReport, reportToPlainText } from "@/lib/report-engine";
import { searchKnowledgeBaseIndex } from "@/lib/kb-indexer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = body.input || {};

    const search = await searchKnowledgeBaseIndex({
      subject: input.subject,
      unit: input.unit,
      interest: input.interest,
      targetMajor: input.targetMajor,
      topic: input.topic,
      query: [input.subject, input.unit, input.interest, input.topic, input.priorActivity].filter(Boolean).join(" "),
      limit: 8,
    });

    if (!search.ok || search.chunks.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          message: search.message || "입력 조건과 일치하는 Knowledge Base 본문 자료를 찾지 못했습니다.",
          diagnostics: {
            subjectProfile: input.subject || "",
            indexedAt: search.indexedAt || null,
            totalChunks: search.totalChunks || 0,
            extractedCount: 0,
            message: "관리자 페이지에서 본문 인덱싱을 실행했는지, 그리고 입력 과목과 관련 자료가 색인되어 있는지 확인해 주세요.",
          },
          sourceUseStatus: {
            googleDriveContentUsed: false,
            driveEvidenceCount: 0,
            policy: "보고서 생성은 Knowledge Base 본문 인덱스에서 검색된 자료만 사용합니다.",
          },
        },
        { status: 400 }
      );
    }

    const evidence = search.chunks.map((chunk: any, index: number) => ({
      title: chunk.title || chunk.fileName || `색인 자료 ${index + 1}`,
      sourceType: "Knowledge Base 색인",
      authorsYear: chunk.title || chunk.fileName || `색인 자료 ${index + 1}`,
      coreContent: chunk.text,
      useInReport: `Knowledge Base 본문 인덱스에서 검색된 ${chunk.subject} / ${chunk.unit} 관련 자료로 활용하였다.`,
      extractedLength: chunk.text.length,
      inferredSubject: chunk.subject,
      inferredUnit: chunk.unit,
      inferredTopic: chunk.topic,
      inferredKeywords: chunk.keywords,
      subjectScore: chunk.score,
    }));

    const report = generateReport({ ...input, driveEvidence: evidence });

    if (!report.ok) {
      return NextResponse.json(report, { status: 400 });
    }

    return NextResponse.json({
      ...report,
      plainText: reportToPlainText(report),
      kbSearchStatus: {
        indexedAt: search.indexedAt,
        totalChunks: search.totalChunks,
        totalItems: search.totalItems,
        usedChunks: search.chunks.length,
      },
      sourceUseStatus: {
        googleDriveContentUsed: true,
        driveEvidenceCount: evidence.length,
        policy: "Google Drive에서 미리 색인된 Knowledge Base 본문 자료만 사용했습니다.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "보고서 생성 실패" },
      { status: 500 }
    );
  }
}
