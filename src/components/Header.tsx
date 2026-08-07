import Link from "next/link";

export function Header() {
  return (
    <header className="siteHeader">
      <Link href="/" className="brand">
        <div className="brandLogo">
          <span className="brandEye" />
        </div>
        <span>다르마(DHARMA) AI</span>
      </Link>

      <nav className="nav">
        <Link href="/">홈</Link>
        <Link href="/materials">자료 다운로드</Link>
        <Link href="/pricing">요금</Link>
        <Link href="/system">시스템</Link>
        <Link href="/login">로그인</Link>
        <Link className="navButton" href="/signup">회원가입</Link>
      </nav>
    </header>
  );
}
