-- DHARMA AI 잘못 등록된 자료 목록 초기화
-- 숫자 파일명으로 잘못 등록된 dharma_materials 목록을 비웁니다.
-- 주의: 실제 Storage 파일은 삭제하지 않고, 고객 화면 자료 목록만 비웁니다.

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

select
  title,
  file_name,
  price,
  price_label
from public.dharma_materials
where
  coalesce(title, '') ilike '%소논문%'
  or coalesce(file_name, '') ilike '%소논문%'
order by title;

