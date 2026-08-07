import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const topic = body.topic || "선택 자료 기반 탐구 주제";

    const subjects = Array.from(new Set(items.map((item: any) => item.subject).filter(Boolean)));
    const keywords = Array.from(new Set(items.flatMap((item: any) => item.keywords || []))).slice(0, 10);
    const careers = Array.from(new Set(items.flatMap((item: any) => item.careerFit || []))).slice(0, 6);

    return NextResponse.json({
      ok: true,
      title: topic,
      basedOn: items.map((item: any) => item.displayName || "비공개 검증 자료"),
      reportPlan: {
        탐구동기: `${subjects.join(", ") || "선택 과목"} 분류 자료에서 출발하여 학생의 관심 진로와 연결되는 탐구 필요성을 제시합니다.`,
        연구질문: `${keywords.slice(0, 3).join(", ") || "핵심 개념"}을 중심으로 검증 가능한 탐구 질문을 설정합니다.`,
        이론적배경: "원자료 내용은 노출하지 않고 핵심 개념과 교육과정 연결성만 재구성합니다.",
        자료분석: "선택 자료의 공개 가능한 메타데이터를 바탕으로 탐구 근거를 정리합니다.",
        심화탐구: "최신 연구 동향과 비교하여 심화 방향을 제안합니다.",
        진로연계: `${careers.join(", ") || "희망 진로"}와 연결해 학생부 활용 가능성을 높입니다.`,
        결론: "DHARMA TRUST INDEX™ 기준에 따라 자료 신뢰성, 논리성, 진로 적합성을 점검합니다.",
      },
      exposurePolicy: "보고서 초안에는 Google Drive 원문, 원본 파일명, Drive 링크를 포함하지 않습니다.",
      rule: "이 초안은 원자료를 그대로 출력하지 않고, 공개 가능한 메타데이터를 바탕으로 탐구 구조만 생성합니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "보고서 초안 생성 실패",
      },
      { status: 500 }
    );
  }
}
