import Link from "next/link";

export default function ProductAdminShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-8 py-5 text-heading-6">
        <Link href="/" className="text-content">
          생일펀딩
        </Link>
        <span className="text-border">|</span>
        <span>상품관리</span>
      </header>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
