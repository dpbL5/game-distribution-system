import Link from "next/link";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { createDeveloperAction, deleteDeveloperAction } from "@/modules/admin/presentation/actions";

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
      <form className="panel stack" action={createDeveloperAction}>
        <h2>Thêm nhà phát triển</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên</label>
            <input id="name" name="name" placeholder="Tên nhà phát triển" required />
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
      {developers.length === 0 ? (
        <div className="panel empty-state">
          <p className="muted">Chưa có nhà phát triển nào trong hệ thống.</p>
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
              {developers.map((developer) => (
                <tr key={developer.id}>
                  <td>
                    <Link href={`/admin/developers/${developer.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>
                      {developer.name}
                    </Link>
                  </td>
                  <td className="table-actions">
                    <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <Link href={`/admin/developers/${developer.id}`} className="button button-secondary">
                        Xem / sửa
                      </Link>
                      <form action={deleteDeveloperAction}>
                        <input type="hidden" name="id" value={developer.id} />
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
