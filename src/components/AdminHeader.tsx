import Link from "next/link";

export function AdminHeader() {
  return (
    <header className="siteHeader">
      <Link href="/admin" className="brand">
        <div className="brandLogo"><span className="brandEye" /></div>
        <span>DHARMA 관리자</span>
      </Link>
      <nav className="nav">
        <Link href="/admin">관리자 홈</Link>
        <Link href="/admin/google-drive">Drive 동기화</Link>
        <Link href="/admin/google-drive/convert">Docs 변환</Link>
        <Link href="/admin/knowledge-base">Knowledge Base</Link>
        <Link href="/admin/knowledge-base/index">본문 인덱싱</Link>
        <Link href="/admin/purchases">구매/다운로드</Link>
        <Link href="/materials">자료 스토어</Link>
        <Link href="/">고객 홈페이지</Link>
        <Link className="navButton" href="/api/admin/logout">로그아웃</Link>
      </nav>
    </header>
  );
}
