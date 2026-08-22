import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
export const runtime="nodejs"; export const dynamic="force-dynamic";
function eq(a:string,b:string){const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&crypto.timingSafeEqual(aa,bb);}
export async function POST(request:NextRequest){const eid=process.env.TOSS_REVIEW_TEST_ID||"";const epw=process.env.TOSS_REVIEW_TEST_PASSWORD||"";if(!eid||!epw)return NextResponse.json({ok:false,message:"토스 심사용 테스트 계정 환경변수가 설정되지 않았습니다."},{status:503});const b=await request.json().catch(()=>({}));if(!eq(String(b.id||""),eid)||!eq(String(b.password||""),epw))return NextResponse.json({ok:false,message:"테스트 ID 또는 비밀번호가 올바르지 않습니다."},{status:401});const r=NextResponse.json({ok:true});r.cookies.set("dharma_toss_review","authorized",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*14});return r;}
