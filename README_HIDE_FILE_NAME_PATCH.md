# DHARMA AI 파일명 숨김 패치

## 목적
- `러셀광주근태관리` 파일을 DHARMA 화면에서 제외
- Google Drive 원본 파일명을 화면에 그대로 노출하지 않고 `자료 1`, `자료 2` 형식으로 표시
- Knowledge Base와 Report Lab 모두에 적용

## 적용 방법
압축을 풀고 나온 `src` 폴더를 기존 프로젝트 `DHARMA_AI_v4_RC` 폴더에 붙여넣으세요.
물어보면 `대상 파일로 바꾸기`를 선택합니다.

## 실행
```bash
npm.cmd run dev
```

## 확인
```text
http://localhost:3000/knowledge-base
http://localhost:3000/report-lab
http://localhost:3000/api/drive/sync
```
