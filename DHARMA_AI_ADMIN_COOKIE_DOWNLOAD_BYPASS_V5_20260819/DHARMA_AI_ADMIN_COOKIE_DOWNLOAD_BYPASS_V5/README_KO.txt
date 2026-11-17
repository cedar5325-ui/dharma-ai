DHARMA AI V5 - 관리자 쿠키 직접 확인 다운로드 허용 패치

확인된 실제 관리자 인증 방식
- 쿠키 이름: dharma_admin_session
- 인증된 값: authorized

정책
1) dharma_admin_session=authorized
   -> 관리자 다운로드 허용

2) 관리자 아님 + PG 승인 전
   -> 검색/상세 가능
   -> 다운로드 차단

3) 관리자 아님 + PG 승인 후
   -> 기존 V3 결제/구매 검증 그대로
   -> 구매 완료 자료만 다운로드 허용

이 패치는 다음을 변경하지 않습니다.
- DHARMA_PG_APPROVED
- DHARMA_TEST_PURCHASE_ENABLED
- 결제 확인 API
- 구매 검증 로직
- 관리자 비밀번호
- middleware 인증 정책

적용 후:
npm.cmd run build
npm.cmd run dev

테스트:
A. InPrivate /materials -> 다운로드 차단
B. 일반 브라우저 /admin-login 로그인 -> 같은 브라우저 /materials -> 다운로드 허용
C. 로그아웃 -> 다시 다운로드 차단
