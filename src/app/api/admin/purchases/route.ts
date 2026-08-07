import { NextResponse } from 'next/server';
import { listPurchases } from '@/lib/purchase-store';
export const runtime='nodejs';
export async function GET(){try{const purchases=await listPurchases(); return NextResponse.json({ok:true,count:purchases.length,purchases})}catch(e){return NextResponse.json({ok:false,message:e instanceof Error?e.message:'구매 내역 오류'},{status:500})}}
