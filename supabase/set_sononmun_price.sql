-- 파일명 또는 제목에 '소논문'이 포함된 기존 자료만 50,000원으로 변경합니다.

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

-- 변경된 소논문 자료 확인
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
