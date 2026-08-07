import { NextRequest, NextResponse } from "next/server";
import { recommendTopics } from "@/lib/report-engine";
export async function POST(request:NextRequest){try{const body=await request.json(); return NextResponse.json({ok:true,topics:recommendTopics(body.input||{}),rule:"주제 추천은 사용자가 입력한 과목·단원·진로 정보만 사용합니다. 보고서 본문은 Google Drive 자료만 사용합니다."})}catch{return NextResponse.json({ok:false,message:"주제 추천 실패"},{status:500})}}
