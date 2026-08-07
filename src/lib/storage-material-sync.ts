import { getOriginalFilesBucket, listStorageObjects, upsertMaterialRows } from '@/lib/supabase-storage-store';

type Obj = { id?: string | null; name: string; metadata?: any; updated_at?: string | null; created_at?: string | null; path?: string };

const subjects = [
  ['생명과학',['생명','막전위','알츠하이머','세포','유전자','면역','신경']],
  ['화학',['화학','ph','산성','염기','중화','이성질체','화학평형']],
  ['수학',['수학','공통수학','미적분','확률','통계','함수','수열','조합','순열','기하','벡터','모멘트']],
  ['윤리와사상',['윤리','칸트','롤스','공리주의','정의']],
  ['사회문제탐구',['사회','경제','정책','지역','정치와법']],
  ['국어',['국어','문학','독서','화법','작문']],
  ['영어',['영어','english']],
  ['정보',['정보','인공지능','ai','알고리즘','데이터','코딩']],
] as const;

function norm(s:string){return String(s||'').toLowerCase().normalize('NFKC').replace(/\s+/g,'')}
function ext(n:string){return (String(n||'').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1])||''}
function strip(n:string){return String(n||'').replace(/\.[^/.]+$/,'')}
function supported(n:string){return ['hwp','hwpx','docx','pdf','pptx','xlsx','zip'].includes(ext(n))}
function type(n:string){const e=ext(n); return e==='hwp'?'HWP':e==='hwpx'?'HWPX':e==='docx'?'DOCX':e==='pdf'?'PDF':e==='pptx'?'PPTX':e==='xlsx'?'XLSX':e==='zip'?'ZIP':'파일'}
function subject(t:string){const n=norm(t); for(const [s,words] of subjects){ if(words.some(w=>n.includes(norm(w)))) return s } return '분류 대기'}
function unit(t:string,s:string){const n=norm(t); const c=['이성질체','수열','순열','조합','개수','막전위','알츠하이머','산염기','중화반응','화학평형','함수','미분','확률과통계','벡터','모멘트','기하']; return c.find(x=>n.includes(norm(x))) || (s==='분류 대기'?'단원 미분류':`${s} 관련 단원`) }
function keywords(name:string,s:string,u:string){return Array.from(new Set([s,u,...strip(name).replace(/[★☆]/g,'').split(/[_\-\s,·()]+/).filter(x=>x.length>=2).slice(0,8)])).slice(0,10)}
function isFolder(o:Obj){return !!o.name && !o.id && !o.metadata?.size && !/\.[a-z0-9]+$/i.test(o.name)}
function isFile(o:Obj){return !!o.name && o.name!=='.emptyFolderPlaceholder' && (!!o.id || typeof o.metadata?.size==='number' || /\.[a-z0-9]+$/i.test(o.name))}

async function scan(prefix='', depth=0): Promise<Obj[]> {
  if(depth>8) return [];
  const items = await listStorageObjects(prefix);
  let out: Obj[] = [];
  for(const item of items||[]){
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if(isFolder(item)) out = out.concat(await scan(path, depth+1));
    else if(isFile(item)) out.push({...item, path});
  }
  return out;
}

export async function syncStorageMaterials(){
  const bucket=getOriginalFilesBucket();
  const files=await scan('');
  const originals=files.filter(f=>supported(f.name));
  const rows=originals.map(f=>{const s=subject(`${f.path} ${f.name}`); const u=unit(`${f.path} ${f.name}`,s); return {
    title: strip(f.name), subject:s, unit:u, keywords:keywords(f.name,s,u), file_type:type(f.name), file_name:f.name,
    mime_type:f.metadata?.mimetype || null, size_bytes:f.metadata?.size || null,
    storage_bucket:bucket, storage_path:f.path, price:20000, price_label:'20,000원',
    description:'Supabase Storage에 등록된 HWP/HWPX/DOCX 원문 다운로드 자료입니다.',
    download_policy:'결제 완료 후 원문 파일 전체를 그대로 다운로드합니다.', is_active:true, updated_at:new Date().toISOString()
  }});
  const saved=await upsertMaterialRows(rows);
  return { ok:true, bucket, scanned:files.length, supported:originals.length, saved:saved.length, skipped:files.length-originals.length, materials:saved, message:'Supabase Storage 원문 자료 동기화 완료' };
}
