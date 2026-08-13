-- DHARMA 홈페이지 '마지막 자료 업로드 시각' 자동 갱신
-- Supabase SQL Editor에서 한 번만 실행하세요.
-- 이후 public.dharma_materials에 새 자료가 INSERT될 때마다 시각이 자동 기록됩니다.

begin;

create table if not exists public.dharma_system_status (
  status_key text primary key,
  event_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create or replace function public.dharma_touch_last_material_upload()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.dharma_system_status (
    status_key,
    event_at,
    updated_at
  )
  values (
    'last_material_upload',
    now(),
    now()
  )
  on conflict (status_key)
  do update set
    event_at = excluded.event_at,
    updated_at = excluded.updated_at;

  return null;
end;
$$;

drop trigger if exists dharma_material_upload_clock
on public.dharma_materials;

create trigger dharma_material_upload_clock
after insert on public.dharma_materials
for each statement
execute function public.dharma_touch_last_material_upload();

alter table public.dharma_system_status enable row level security;

drop policy if exists "read last material upload time"
on public.dharma_system_status;

create policy "read last material upload time"
on public.dharma_system_status
for select
using (status_key = 'last_material_upload');

commit;

-- 확인용: 새 자료를 한 건 업로드한 뒤 실행하면 event_at이 바뀌어야 합니다.
select status_key, event_at, updated_at
from public.dharma_system_status
where status_key = 'last_material_upload';
