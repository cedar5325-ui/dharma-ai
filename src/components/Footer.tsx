import Link from "next/link";
import { siteInfo } from "@/data/site";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>{siteInfo.serviceName}</strong>
        <p>교육은 지식을 전달하는 것이 아니라 사고를 설계하는 것입니다.</p>
      </div>
      <div className="footerGrid">
        <p>상호: {siteInfo.company}</p>
        <p>사업자등록번호: {siteInfo.businessNumber}</p>
        <p>대표자: {siteInfo.representative}</p>
        <p>이메일: {siteInfo.email}</p>
        <p>고객센터: {siteInfo.customerCenter}</p>
        <p>주소: {siteInfo.address}</p>
        <Link href="/terms">이용약관</Link>
        <Link href="/privacy">개인정보처리방침</Link>
        <Link href="/refund">환불규정</Link>
      </div>
    </footer>
  );
}
