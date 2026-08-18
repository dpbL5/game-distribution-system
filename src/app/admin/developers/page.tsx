import { Boxes } from "lucide-react";

import { adminService } from "@/modules/admin/infrastructure/admin-service";

export default async function AdminDevelopersPage() {
  const developers = await adminService.developers();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Nhà phát triển</h1>
        </div>
      </div>
      {developers.length === 0 ? (
        <div className="panel empty-state">
          <p className="muted">Chưa có nhà phát triển nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="card-grid">
          {developers.map((developer) => (
            <div className="panel stack" key={developer.id}>
              <span className="metric-icon" aria-hidden="true">
                <Boxes size={18} strokeWidth={2.25} />
              </span>
              <h2>{developer.name}</h2>
              <span className="muted small">Nhà phát triển</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
