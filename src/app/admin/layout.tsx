import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

import { requireAdmin } from "@/modules/auth/application/guards";
import { isAppError } from "@/shared/errors/app-error";
import { AdminNavigation } from "@/shared/ui/admin-navigation";
import { Brand } from "@/shared/ui/brand";
import { StatusBadge } from "@/shared/ui/status-badge";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (isAppError(error) && error.code === "FORBIDDEN") redirect("/forbidden");
    throw error;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand href="/admin" />
        <div className="admin-sidebar-heading">
          <span className="admin-kicker">Khu vực quản trị</span>
          <span>Vận hành PlayPort</span>
        </div>
        <div className="admin-identity">
          <span className="admin-identity-avatar" aria-hidden="true">
            <ShieldCheck size={18} strokeWidth={2.25} />
          </span>
          <div className="admin-identity-text">
            <span className="admin-identity-name">{admin.displayName}</span>
            <StatusBadge tone="info">Quản trị viên</StatusBadge>
          </div>
        </div>
        <AdminNavigation />
        <Link className="admin-store-link" href="/">
          Về cửa hàng
          <ArrowUpRight aria-hidden="true" size={17} />
        </Link>
      </aside>
      <section className="admin-content">{children}</section>
    </div>
  );
}
