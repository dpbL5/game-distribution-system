import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { createCategoryAction } from "@/modules/admin/presentation/actions";
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
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.slug}</td>
                <td>{category.gameCount}</td>
                <td>
                  <StatusBadge tone={category.isActive ? "success" : "warning"}>
                    {formatStatus(category.isActive ? "ACTIVE" : "INACTIVE")}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
