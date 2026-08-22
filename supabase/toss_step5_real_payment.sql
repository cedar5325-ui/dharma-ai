-- DHARMA Toss Payments STEP 5
-- Supabase SQL Editor에서 코드 배포 전에 1회 실행하세요.

begin;

alter table public.dharma_purchases
  add column if not exists toss_order_id text,
  add column if not exists toss_payment_key text,
  add column if not exists toss_status text,
  add column if not exists toss_method text,
  add column if not exists paid_at timestamptz;

create unique index if not exists dharma_purchases_toss_order_id_uidx
  on public.dharma_purchases (toss_order_id)
  where toss_order_id is not null;

create unique index if not exists dharma_purchases_toss_payment_key_uidx
  on public.dharma_purchases (toss_payment_key)
  where toss_payment_key is not null;

commit;

select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'dharma_purchases'
  and column_name in (
    'toss_order_id',
    'toss_payment_key',
    'toss_status',
    'toss_method',
    'paid_at'
  )
order by column_name;
