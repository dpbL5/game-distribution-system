import Link from "next/link";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { createCategoryAction, deleteCategoryAction } from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatStatus } from "@/shared/utils/format-status";

export default async function AdminCategoriesPage() {
  const categories = await adminService.categories();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH MỤC</span>
          <h1>Thể loại</h1>
        </div>
      </div>
      <form className="panel stack" action={createCategoryAction}>
        <h2>Thêm thể loại</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên thể loại</label>
            <input id="name" name="name" placeholder="Tên thể loại" required />
          </div>
          <div className="field">
            <label htmlFor="slug">Đường dẫn</label>
            <input id="slug" name="slug" placeholder="category-slug" required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả</label>
          <textarea id="description" name="description" placeholder="Mô tả thể loại (tùy chọn)" />
        </div>
        <button className="button button-primary" type="submit">
          Thêm thể loại
        </button>
      </form>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Đường dẫn</th>
              <th>Game</th>
              <th>Trạng thái</th>
              <th className="table-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <Link href={`/admin/categories/${category.id}`} style={{ fontWeight: 700, textDecoration: "underline" }}>
                    {category.name}
                  </Link>
                </td>
                <td>{category.slug}</td>
                <td>{category.gameCount}</td>
                <td>
                  <StatusBadge tone={category.isActive ? "success" : "warning"}>{formatStatus(category.isActive ? "ACTIVE" : "INACTIVE")}</StatusBadge>
                </td>
                <td className="table-actions">
                  <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <Link href={`/admin/categories/${category.id}`} className="button button-secondary">
                      Xem / sửa
                    </Link>
                    <form action={deleteCategoryAction}>
                      <input type="hidden" name="id" value={category.id} />
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
    </main>
  );
}
