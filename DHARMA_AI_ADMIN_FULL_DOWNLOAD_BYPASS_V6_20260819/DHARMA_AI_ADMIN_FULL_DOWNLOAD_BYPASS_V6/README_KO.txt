DHARMA AI V6 - 관리자 로그인 시 결제 없이 원문 다운로드

목표
====
관리자만 기존 관리자 로그인 세션으로 결제 기록 없이 다운로드합니다.
일반 고객의 기존 V3 PG/결제 정책은 변경하지 않습니다.

최종 흐름
=========
관리자(dharma_admin_session=authorized)
  -> token 필수 검사 우회
  -> dharma_purchases 결제기록 조회 우회
  -> 구매기록 download_count 수정 안 함
  -> 원문 signed URL 생성 후 다운로드

일반 고객
  -> 기존 V3 PG 승인 검사
  -> PG 승인 전 다운로드 차단
  -> PG 승인 후 purchase token 필요
  -> status=paid 구매기록 필요
  -> 다운로드 후 기존 download_count 갱신

변경하지 않는 것
================
- DHARMA_PG_APPROVED
- DHARMA_TEST_PURCHASE_ENABLED
- fetchPaidPurchase 함수 자체
- 결제/구매 API
- 관리자 비밀번호
- 관리자 로그인/로그아웃 API
- middleware

적용
====
1. 이 ZIP 압축 해제
2. VS Code PowerShell:
   $project = "C:\Users\82105\Desktop\2026년 신규사업\DHARMA_AI_v4_RC"
   $script = Get-ChildItem -Path $project -Filter "APPLY_ADMIN_FULL_DOWNLOAD_BYPASS_V6.mjs" -File -Recurse | Select-Object -First 1
   node $script.FullName --project $project

3. 빌드:
   npm.cmd run build

4. 실행:
   npm.cmd run dev

5. 테스트:
   - InPrivate /materials -> 다운로드 차단
   - 일반 브라우저 /admin-login 로그인 -> 같은 브라우저 /materials -> 관리자 다운로드 성공
   - 관리자 로그아웃 -> 다시 다운로드 차단

6. 성공한 뒤 Git:
   git add -- ":(literal)src/app/api/materials/[id]/download/route.ts"
   git commit -m "Allow full material downloads for authenticated admin"
   git push origin main
