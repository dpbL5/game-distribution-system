import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="state-page" aria-labelledby="forbidden-title">
      <div className="state-card">
        <span className="state-icon" aria-hidden="true">
          <ShieldX size={26} strokeWidth={2.25} />
        </span>
        <p className="eyebrow">PLAYPORT / 403</p>
        <h1 id="forbidden-title">Không có quyền truy cập</h1>
        <p>Tài khoản của bạn không đủ quyền để mở khu vực quản trị.</p>
        <Link className="button button-primary" href="/">
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
