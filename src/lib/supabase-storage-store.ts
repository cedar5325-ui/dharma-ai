const DEFAULT_BUCKET = 'dharma-original-files';

function supabaseUrl() {
  return String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function getOriginalFilesBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
}

function assertReady() {
  const url = supabaseUrl();
  const key = serviceKey();
  if (!url || !key) throw new Error('SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다.');
  return { url, key };
}

function headers(extra: Record<string,string> = {}) {
  const { key } = assertReady();
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra };
}

async function parse(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

export async function rest<T=any>(path: string, init: RequestInit = {}): Promise<T> {
  const { url } = assertReady();
  const res = await fetch(`${url}/rest/v1${path}`, { ...init, headers: headers((init.headers || {}) as any), cache: 'no-store' });
  if (!res.ok) throw new Error(`Supabase REST 오류 ${res.status}: ${JSON.stringify(await parse(res))}`);
  if (res.status === 204) return null as T;
  return await res.json();
}

export async function storage<T=any>(path: string, init: RequestInit = {}): Promise<T> {
  const { url } = assertReady();
  const res = await fetch(`${url}/storage/v1${path}`, { ...init, headers: headers((init.headers || {}) as any), cache: 'no-store' });
  if (!res.ok) throw new Error(`Supabase Storage 오류 ${res.status}: ${JSON.stringify(await parse(res))}`);
  if (res.status === 204) return null as T;
  return await res.json();
}

function encPath(path: string) {
  return String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
}

export async function listStorageObjects(prefix = '') {
  const bucket = getOriginalFilesBucket();
  return storage<any[]>(`/object/list/${bucket}`, {
    method: 'POST',
    body: JSON.stringify({ prefix, limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } })
  });
}

export async function createSignedDownloadUrl(storagePath: string, fileName: string, expiresIn = 600) {
  const { url } = assertReady();
  const bucket = getOriginalFilesBucket();
  const data = await storage<any>(`/object/sign/${bucket}/${encPath(storagePath)}`, {
    method: 'POST', body: JSON.stringify({ expiresIn })
  });
  const signed = data?.signedURL || data?.signedUrl || data?.signed_url || data?.url || '';
  if (!signed) throw new Error('Supabase Storage signed URL 생성 실패');
  const full = signed.startsWith('http') ? signed : `${url}/storage/v1${signed.startsWith('/') ? signed : '/' + signed}`;
  return `${full}${full.includes('?') ? '&' : '?'}download=${encodeURIComponent(fileName || 'download')}`;
}

export async function listMaterialRows() {
  return rest<any[]>('/dharma_materials?select=*&is_active=eq.true&order=title.asc');
}

export async function getMaterialRowById(id: string) {
  const rows = await rest<any[]>(`/dharma_materials?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] || null;
}

export async function upsertMaterialRows(rows: any[]) {
  if (!rows.length) return [];
  return rest<any[]>('/dharma_materials?on_conflict=storage_bucket,storage_path', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(rows)
  });
}

export async function insertPurchase(row: any) {
  const rows = await rest<any[]>('/dharma_purchases', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
  return rows[0] || null;
}

export async function findPaidPurchase(materialId: string, token: string) {
  const rows = await rest<any[]>(`/dharma_purchases?select=*&material_id=eq.${encodeURIComponent(materialId)}&purchase_token=eq.${encodeURIComponent(token)}&status=eq.paid&limit=1`);
  return rows[0] || null;
}

export async function markPaid(idOrToken: string) {
  let rows = await rest<any[]>(`/dharma_purchases?id=eq.${encodeURIComponent(idOrToken)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status:'paid', paid_at:new Date().toISOString(), updated_at:new Date().toISOString() }) });
  if (!rows[0]) rows = await rest<any[]>(`/dharma_purchases?purchase_token=eq.${encodeURIComponent(idOrToken)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status:'paid', paid_at:new Date().toISOString(), updated_at:new Date().toISOString() }) });
  return rows[0] || null;
}

export async function markDownloadedRow(id: string, currentCount = 0) {
  const rows = await rest<any[]>(`/dharma_purchases?id=eq.${encodeURIComponent(id)}`, { method:'PATCH', headers:{ Prefer:'return=representation' }, body: JSON.stringify({ downloaded_at:new Date().toISOString(), download_count:Number(currentCount||0)+1, updated_at:new Date().toISOString() }) });
  return rows[0] || null;
}

export async function getPurchaseById(id: string) {
  const rows = await rest<any[]>(`/dharma_purchases?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] || null;
}

export async function listPurchaseRows() {
  return rest<any[]>('/dharma_purchases?select=*&order=created_at.desc&limit=200');
}
