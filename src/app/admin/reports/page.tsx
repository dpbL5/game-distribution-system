import { Banknote, Crown, PackageCheck, TrendingUp } from "lucide-react";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { formatMoney } from "@/shared/utils/format-money";

export default async function AdminReportsPage() {
  const dashboard = await adminService.dashboard();
  const metrics = [
    { label: "Doanh thu", value: formatMoney(dashboard.revenue), icon: Banknote },
    { label: "Đơn đã thanh toán", value: dashboard.orders, icon: PackageCheck },
    { label: "Giao dịch", value: dashboard.transactions, icon: TrendingUp },
    {
      label: "Bán chạy nhất",
      value: dashboard.bestSeller?.name ?? "—",
      icon: Crown,
      small: true,
    },
  ];
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BÁO CÁO</span>
          <h1>Báo cáo</h1>
          <p className="lede">
            Doanh thu, đơn hàng, giao dịch và game bán chạy chỉ tính từ các đơn đã thanh toán.
          </p>
        </div>
      </div>
      <div className="metric-grid">
        {metrics.map(({ label, value, icon: Icon, small }) => (
          <div className="metric" key={label}>
            <div className="metric-head">
              <span className="eyebrow">{label}</span>
              <span className="metric-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={2.25} />
              </span>
            </div>
            <span className={`metric-value ${small ? "small" : ""}`}>{value}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
