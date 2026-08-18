import { Building2 } from "lucide-react";

import { adminService } from "@/modules/admin/infrastructure/admin-service";

export default async function AdminPublishersPage() {
  const publishers = await adminService.publishers();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Nhà phát hành</h1>
        </div>
      </div>
      {publishers.length === 0 ? (
        <div className="panel empty-state">
          <p className="muted">Chưa có nhà phát hành nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="card-grid">
          {publishers.map((publisher) => (
            <div className="panel stack" key={publisher.id}>
              <span className="metric-icon" aria-hidden="true">
                <Building2 size={18} strokeWidth={2.25} />
              </span>
              <h2>{publisher.name}</h2>
              <span className="muted small">Nhà phát hành</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
