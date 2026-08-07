import { getMaterialRowById, listMaterialRows } from '@/lib/supabase-storage-store';

export type MaterialItem = {
  id:string; fileId:string; title:string; fileName:string; mimeType:string; modifiedTime?:string|null; webViewLink?:string|null;
  subject:string; unit:string; keywords:string[]; fileType:string; price:number; priceLabel:string; description:string; downloadPolicy:string;
  topicKey:string; availableFormats:string[]; alternativeCount:number; alternativeFileIds:string[]; selectedReason:string; storageBucket:string; storagePath:string; sizeBytes?:number|null;
};
function norm(s:string){return String(s||'').toLowerCase().normalize('NFKC').replace(/\s+/g,'')}
function toItem(r:any):MaterialItem{return { id:r.id, fileId:r.id, title:r.title, fileName:r.file_name, mimeType:r.mime_type||'', modifiedTime:r.updated_at||null, webViewLink:null, subject:r.subject||'분류 대기', unit:r.unit||'단원 미분류', keywords:r.keywords||[], fileType:r.file_type||'파일', price:r.price||20000, priceLabel:r.price_label||'20,000원', description:r.description||'Supabase Storage 원문 다운로드 자료입니다.', downloadPolicy:r.download_policy||'결제 완료 후 원문 파일 전체를 다운로드합니다.', topicKey:r.storage_path, availableFormats:[r.file_type||'파일'], alternativeCount:1, alternativeFileIds:[r.id], selectedReason:'Supabase Storage 원문 파일을 다운로드합니다.', storageBucket:r.storage_bucket, storagePath:r.storage_path, sizeBytes:r.size_bytes }}
export async function listMaterials(_accessToken?:string){return (await listMaterialRows()).map(toItem)}
export async function getMaterialById(arg1:string,arg2?:string){const row=await getMaterialRowById(arg2||arg1); return row?toItem(row):null}
export function filterMaterials(materials:MaterialItem[], query?:string, subject?:string){const q=norm(query||''); const s=norm(subject||''); return materials.filter(m=>{const t=norm(`${m.title} ${m.fileName} ${m.subject} ${m.unit} ${m.keywords.join(' ')} ${m.fileType}`); return (!q||t.includes(q)) && (!s||norm(m.subject).includes(s))})}
