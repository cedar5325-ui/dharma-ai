-- DHARMA 가격 정책 통일
-- 일반 탐구보고서: 20,000원 / 소논문: 50,000원
-- Supabase SQL Editor에서 1회 실행합니다.

begin;

-- 소논문: 제목 또는 파일명에 '소논문'이 포함되면 50,000원
update public.dharma_materials
set
  price = 50000,
  price_label = '50,000원',
  description = '소논문으로 분류된 프리미엄 원문 다운로드 자료입니다.',
  download_policy = '결제 완료 후 소논문 원문 파일 전체를 그대로 다운로드합니다.',
  updated_at = now()
where
  coalesce(title, '') ilike '%소논문%'
  or coalesce(file_name, '') ilike '%소논문%';

-- 그 외 모든 자료: 20,000원
update public.dharma_materials
set
  price = 20000,
  price_label = '20,000원',
  description = '교과·도서 연계 일반 탐구보고서 원문 다운로드 자료입니다.',
  download_policy = '결제 완료 후 원문 파일 전체를 그대로 다운로드합니다.',
  updated_at = now()
where not (
  coalesce(title, '') ilike '%소논문%'
  or coalesce(file_name, '') ilike '%소논문%'
);

commit;

-- 최종 확인: 20,000원과 50,000원 이외의 가격이 없어야 합니다.
select
  price,
  price_label,
  count(*) as material_count
from public.dharma_materials
group by price, price_label
order by price;
