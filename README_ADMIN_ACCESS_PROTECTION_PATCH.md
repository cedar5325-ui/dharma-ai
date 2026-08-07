# DHARMA AI 관리자 접근 제한 패치

## 목적
고객이 관리자 페이지와 관리자 API에 접근하지 못하게 막습니다.

## 보호되는 경로
```text
/admin/*
/api/admin/*
```

## 추가 파일
```text
middleware.ts
.env.admin.example
src/app/admin-login/page.tsx
src/app/api/admin/login/route.ts
src/app/api/admin/logout/route.ts
```

## 적용 방법
압축을 풀고 나온 파일을 기존 프로젝트 `DHARMA_AI_v4_RC`에 붙여넣으세요.
물어보면 `대상 파일로 바꾸기`를 선택합니다.

## .env.local에 추가할 값
기존 `.env.local` 맨 아래에 아래 한 줄을 추가하세요.

```env
ADMIN_PASSWORD=원하는_관리자_비밀번호
```

예:
```env
ADMIN_PASSWORD=MyStrongAdminPassword123!
```

## 실행
```bash
npm.cmd run dev
```

## 확인
```text
http://localhost:3000/admin/google-drive
```

관리자 로그인 화면으로 이동하면 정상입니다.

## 로그아웃
```text
http://localhost:3000/api/admin/logout
```
