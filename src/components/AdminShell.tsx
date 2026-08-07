import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="appShell">
      <aside className="sidebar dark">
        <Link href="/" className="sidebarBrand">다르마 ADMIN</Link>
        <Link href="/admin">대시보드</Link>
        <Link href="/admin/google-drive">Google Drive</Link>
        <Link href="/knowledge-base">Knowledge Base</Link>
        <Link href="/dashboard">학생 앱</Link>
      </aside>
      <main className="appMain">{children}</main>
    </div>
  );
}
