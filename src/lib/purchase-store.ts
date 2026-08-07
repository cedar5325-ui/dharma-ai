import crypto from 'crypto';
import { findPaidPurchase, getPurchaseById, insertPurchase, listPurchaseRows, markDownloadedRow, markPaid } from '@/lib/supabase-storage-store';
function rec(r:any){return { id:r.id, materialId:r.material_id, materialTitle:r.material_title, amount:r.amount, status:r.status, purchaseToken:r.purchase_token, createdAt:r.created_at, paidAt:r.paid_at, downloadedAt:r.downloaded_at, downloadCount:r.download_count }}
function token(){return crypto.randomBytes(24).toString('hex')}
export async function createPendingPurchase(args:any){const r=await insertPurchase({ material_id:args.materialId, material_title:args.materialTitle||'', amount:args.amount||20000, purchase_token:token(), customer_name:args.customerName||null, customer_phone:args.customerPhone||null, customer_email:args.customerEmail||null }); return rec(r)}
export async function markPurchasePaid(idOrToken:string){const r=await markPaid(idOrToken); return r?rec(r):null}
export async function findPaidPurchaseForMaterial(materialId:string,purchaseToken:string){const r=await findPaidPurchase(materialId,purchaseToken); return r?rec(r):null}
export async function markDownloaded(purchaseId:string){const cur=await getPurchaseById(purchaseId); const r=await markDownloadedRow(purchaseId, cur?.download_count||0); return r?rec(r):null}
export async function listPurchases(){return (await listPurchaseRows()).map(rec)}
