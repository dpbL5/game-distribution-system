import { Building2 } from "lucide-react";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import {
  createPublisherAction,
  deletePublisherAction,
  updatePublisherAction,
} from "@/modules/admin/presentation/actions";

export default async function AdminPublishersPage() {
  const publishers = await adminService.publishers();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Nhà phát hành</h1>
          <p className="lede">Tạo, sửa và xóa nhà phát hành. Không thể xóa khi còn game tham chiếu.</p>
        </div>
      </div>

      <form className="panel stack" action={createPublisherAction}>
        <h2>Thêm nhà phát hành</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="pub-name">Tên nhà phát hành</label>
            <input id="pub-name" name="name" placeholder="Tên nhà phát hành" required />
          </div>
          <div className="field">
            <label htmlFor="pub-website">Website (tùy chọn)</label>
            <input id="pub-website" name="website" placeholder="https://example.com" />
          </div>
        </div>
        <button className="button button-primary" type="submit">
          Tạo
        </button>
      </form>

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
              <form className="stack" action={updatePublisherAction}>
                <input type="hidden" name="id" value={publisher.id} />
                <div className="field">
                  <label htmlFor={`pub-edit-${publisher.id}`}>Sửa tên</label>
                  <input id={`pub-edit-${publisher.id}`} name="name" defaultValue={publisher.name} required />
                </div>
                <button className="button button-secondary" type="submit">
                  Lưu
                </button>
              </form>
              <form action={deletePublisherAction}>
                <input type="hidden" name="id" value={publisher.id} />
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
