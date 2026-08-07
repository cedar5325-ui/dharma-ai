import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <Link href="/" className="sidebarBrand">DHARMA AI</Link>
        <Link href="/dashboard">홈</Link><Link href="/dashboard/profile">학생정보</Link>
        <Link href="/dashboard/topics">주제추천</Link><Link href="/dashboard/report">보고서 생성</Link>
        <Link href="/dashboard/result">결과</Link><Link href="/dashboard/library">Knowledge Base</Link>
      </aside>
      <main className="appMain">{children}</main>
    </div>
  );
}
