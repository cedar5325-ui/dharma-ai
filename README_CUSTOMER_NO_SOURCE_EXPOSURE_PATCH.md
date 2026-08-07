# DHARMA AI 고객 화면 자료 비노출 패치

## 목적
고객이 사용할 때 Google Drive 자료의 다음 항목이 노출되지 않도록 합니다.

- 원본 파일명
- 원문 내용
- Drive 링크
- 민감한 내부 자료명
- 러셀광주근태관리 파일

## 변경 사항
- `/api/drive/sync` 응답에서 원본 파일명, webViewLink 제거
- `/api/knowledge-base` 응답에서 원본 파일명, webViewLink 제거
- `/knowledge-base` 화면에서 공개 가능한 분류 정보만 표시
- `/report-lab` 화면에서 자료 1, 자료 2 방식의 표시명만 사용
- 보고서 초안에 원문 내용, 파일명, Drive 링크 미포함

## 적용 방법
압축을 풀고 나온 `src` 폴더를 기존 프로젝트 `DHARMA_AI_v4_RC`에 붙여넣으세요.
물어보면 `대상 파일로 바꾸기`를 선택합니다.

## 확인 주소
```text
http://localhost:3000/knowledge-base
http://localhost:3000/report-lab
http://localhost:3000/api/drive/sync
http://localhost:3000/api/knowledge-base
```
