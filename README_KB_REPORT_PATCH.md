# DHARMA AI Knowledge Base + Report Patch

## 목적
Google Drive 파일 목록을 Knowledge Base 화면에 표시하고,
과목 / 자료유형 / 난이도 / 키워드를 자동 분류한 뒤,
보고서 생성 구조에 활용합니다.

## 추가/교체 파일
- `src/lib/kb-classifier.ts`
- `src/app/api/drive/sync/route.ts`
- `src/app/api/knowledge-base/route.ts`
- `src/app/api/report/draft/route.ts`
- `src/app/knowledge-base/page.tsx`
- `src/app/report-lab/page.tsx`

## 확인 주소
```text
http://localhost:3000/knowledge-base
http://localhost:3000/report-lab
http://localhost:3000/api/knowledge-base
http://localhost:3000/api/drive/sync
```

## 원칙
Google Drive 자료는 그대로 출력하지 않고,
분석·검증·재구성의 근거로만 사용합니다.
