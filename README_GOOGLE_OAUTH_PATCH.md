# DHARMA AI Google OAuth Drive Patch

서비스 계정 JSON 키 생성이 막힌 경우 사용하는 OAuth 방식 패치입니다.

## 추가/교체 파일
- `.env.oauth.example`
- `src/lib/google-drive-oauth.ts`
- `src/app/api/auth/google/login/route.ts`
- `src/app/api/auth/google/callback/route.ts`
- `src/app/api/auth/google/logout/route.ts`
- `src/app/api/drive/status/route.ts`
- `src/app/api/drive/sync/route.ts`
- `src/app/admin/google-drive/page.tsx`

## .env.local 예시
```env
GOOGLE_CLIENT_ID=클라이언트_ID
GOOGLE_CLIENT_SECRET=클라이언트_보안_비밀번호
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_DRIVE_FOLDER_ID=선택사항_폴더_ID
```

## Google Cloud OAuth 클라이언트 설정
승인된 JavaScript 원본:
```text
http://localhost:3000
```

승인된 리디렉션 URI:
```text
http://localhost:3000/api/auth/google/callback
```

## 실행
```bash
npm.cmd install
npm.cmd run dev
```

## 확인
```text
http://localhost:3000/admin/google-drive
```
