import { Banknote, PackageCheck, TrendingUp, UsersRound } from "lucide-react";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { formatMoney } from "@/shared/utils/format-money";

export default async function AdminPage() {
  const dashboard = await adminService.dashboard();
  const metrics = [
    { label: "Người dùng", value: dashboard.users, icon: UsersRound },
    { label: "Đơn đã thanh toán", value: dashboard.orders, icon: PackageCheck },
    { label: "Doanh thu", value: formatMoney(dashboard.revenue), icon: Banknote },
    { label: "Giao dịch", value: dashboard.transactions, icon: TrendingUp },
  ];
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">QUẢN TRỊ</span>
          <h1>Tổng quan</h1>
          <p className="lede">Tổng quan vận hành từ dữ liệu hiện có trong hệ thống.</p>
        </div>
      </div>
      <div className="metric-grid">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div className="metric" key={label}>
            <div className="metric-head">
              <span className="eyebrow">{label}</span>
              <span className="metric-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={2.25} />
              </span>
            </div>
            <span className="metric-value">{value}</span>
          </div>
        ))}
      </div>
      <div className="panel stack">
        <span className="eyebrow">BÁN CHẠY NHẤT</span>
        <h2>{dashboard.bestSeller?.name ?? "Chưa có game đã thanh toán"}</h2>
        <p className="muted">
          {dashboard.bestSeller
            ? `Đã bán ${dashboard.bestSeller.units} bản`
            : "Các đơn đã thanh toán sẽ xuất hiện ở đây."}
        </p>
      </div>
    </main>
  );
}
