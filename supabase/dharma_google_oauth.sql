-- DHARMA AI Google OAuth token storage table
-- Supabase SQL Editor에서 실행하세요.
create table if not exists public.dharma_google_oauth (
  id text primary key,
  access_token text,
  refresh_token text,
  expires_at bigint,
  scope text,
  token_type text,
  updated_at timestamptz default now()
);

alter table public.dharma_google_oauth enable row level security;

-- 이 테이블은 서버의 service_role key로만 접근합니다.
-- 브라우저 클라이언트에서 직접 접근하는 정책은 만들지 마세요.
