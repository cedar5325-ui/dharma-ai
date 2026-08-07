import { AdminHeader } from "@/components/AdminHeader";

const checks = [
  ["관리자 접근 제한", "적용됨", "관리자 인증 없이는 /admin/* 접근 불가"],
  ["자료 원문 비노출", "적용됨", "고객 화면에는 원문 내용 표시 금지"],
  ["원본 파일명 비노출", "적용됨", "검증 자료 1, 검증 자료 2 방식으로 표시"],
  ["Drive 링크 비노출", "적용됨", "고객 화면과 공개 API에 webViewLink 미표시"],
  ["토스 결제", "준비 중", "토스페이먼츠 승인 후 실제 키 연결 필요"],
  ["회원 DB", "다음 단계", "Supabase 또는 Firebase 연결 예정"],
];

export default function AdminSystemPage() {
  return (
    <>
      <AdminHeader />
      <main className="section white">
        <div className="sectionLabel">ADMIN · SYSTEM</div>
        <h1 className="pageTitle">시스템 관리</h1>
        <p className="subText">
          다르마 AI 상용화를 위한 운영 상태와 보안 원칙을 확인하는 관리자 전용 화면입니다.
        </p>

        <div className="formCard" style={{ marginTop: 32, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">항목</th>
                <th align="left">상태</th>
                <th align="left">설명</th>
              </tr>
            </thead>
            <tbody>
              {checks.map(([name, status, desc]) => (
                <tr key={name} style={{ borderTop: "1px solid #e1ecff" }}>
                  <td style={{ padding: "16px 8px" }}><strong>{name}</strong></td>
                  <td>{status}</td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="loginNotice" style={{ marginTop: 28 }}>
          다음 상용화 단계는 실제 회원 DB 연결과 결제 승인 후 이용권 활성화입니다.
        </div>
      </main>
    </>
  );
}
