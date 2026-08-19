import { Boxes } from "lucide-react";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import {
  createDeveloperAction,
  deleteDeveloperAction,
  updateDeveloperAction,
} from "@/modules/admin/presentation/actions";

export default async function AdminDevelopersPage() {
  const developers = await adminService.developers();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Nhà phát triển</h1>
          <p className="lede">Tạo, sửa và xóa nhà phát triển. Không thể xóa khi còn game tham chiếu.</p>
        </div>
      </div>

      <form className="panel stack" action={createDeveloperAction}>
        <h2>Thêm nhà phát triển</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="dev-name">Tên nhà phát triển</label>
            <input id="dev-name" name="name" placeholder="Tên nhà phát triển" required />
          </div>
          <div className="field">
            <label htmlFor="dev-website">Website (tùy chọn)</label>
            <input id="dev-website" name="website" placeholder="https://example.com" />
          </div>
        </div>
        <button className="button button-primary" type="submit">
          Tạo
        </button>
      </form>

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
              <form className="stack" action={updateDeveloperAction}>
                <input type="hidden" name="id" value={developer.id} />
                <div className="field">
                  <label htmlFor={`dev-edit-${developer.id}`}>Sửa tên</label>
                  <input id={`dev-edit-${developer.id}`} name="name" defaultValue={developer.name} required />
                </div>
                <button className="button button-secondary" type="submit">
                  Lưu
                </button>
              </form>
              <form action={deleteDeveloperAction}>
                <input type="hidden" name="id" value={developer.id} />
                <button className="button button-danger" type="submit">
                  Xóa
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
