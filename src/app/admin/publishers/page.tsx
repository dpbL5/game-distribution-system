import Link from "next/link";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { createPublisherAction, deletePublisherAction } from "@/modules/admin/presentation/actions";

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
      <form className="panel stack" action={createPublisherAction}>
        <h2>Thêm nhà phát hành</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên</label>
            <input id="name" name="name" placeholder="Tên nhà phát hành" required />
          </div>
          <div className="field">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" placeholder="https://..." />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả</label>
          <textarea id="description" name="description" placeholder="Mô tả (tùy chọn)" />
        </div>
        <button className="button button-primary" type="submit">
          Thêm
        </button>
      </form>
      {publishers.length === 0 ? (
        <div className="panel empty-state">
          <p className="muted">Chưa có nhà phát hành nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th className="table-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {publishers.map((publisher) => (
                <tr key={publisher.id}>
                  <td>
                    <Link href={`/admin/publishers/${publisher.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>
                      {publisher.name}
                    </Link>
                  </td>
                  <td className="table-actions">
                    <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <Link href={`/admin/publishers/${publisher.id}`} className="button button-secondary">
                        Xem / sửa
                      </Link>
                      <form action={deletePublisherAction}>
                        <input type="hidden" name="id" value={publisher.id} />
                        <button className="button button-danger" type="submit">
                          Xóa
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
