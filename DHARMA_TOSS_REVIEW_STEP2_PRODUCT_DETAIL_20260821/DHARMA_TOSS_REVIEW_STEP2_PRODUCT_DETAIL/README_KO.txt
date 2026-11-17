DHARMA Toss Payments 심사 준비 - STEP 2

상품 상세페이지(/materials/[id])에 다음 심사정보를 표시합니다.

- 건별 일회성 결제
- 월 구독/자동결제 없음
- 일반 탐구보고서 20,000원
- 소논문 50,000원
- 결제 완료 및 구매내역 확인 후 즉시 제공
- 디지털 교육자료 원문 파일 다운로드
- 이용/다운로드 기간 결제일로부터 30일
- 최대 서비스 제공기간 결제일로부터 30일
- 환불정책 /refund 링크

기존 가격 계산, 결제 API, 다운로드 API는 수정하지 않습니다.

적용:
1. ZIP을 DHARMA_AI_v4_RC 프로젝트 폴더에 저장 후 압축 해제
2. VS Code PowerShell:

$project = "C:\Users\82105\Desktop\2026년 신규사업\DHARMA_AI_v4_RC"
$script = Get-ChildItem -Path $project -Filter "APPLY_TOSS_REVIEW_STEP2_PRODUCT_DETAIL.mjs" -File -Recurse | Select-Object -First 1
node $script.FullName --project $project

3. npm.cmd run build
4. npm.cmd run dev
5. http://localhost:3000/materials -> 실제 자료 1개 선택 -> 상세페이지 하단 확인

성공 후 Git:
git add src/components/TossReviewProductPolicy.tsx
git add -- ":(literal)src/app/materials/[id]/page.tsx"
git commit -m "Add Toss review product service information"
git push origin main
