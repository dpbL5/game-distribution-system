import Link from "next/link";
import { notFound } from "next/navigation";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { deleteCategoryAction, updateCategoryAction } from "@/modules/admin/presentation/actions";

export default async function AdminCategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await adminService.getCategory(id);
  if (!category) notFound();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <Link href="/admin/categories" className="muted small">
            ← Quay lại thể loại
          </Link>
          <h1>{category.name}</h1>
          <p className="lede">
            {category.slug} · {category.gameCount} game
          </p>
        </div>
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={category.id} />
          <button className="button button-danger" type="submit">
            Xóa thể loại
          </button>
        </form>
      </div>
      <form className="panel stack" action={updateCategoryAction}>
        <input type="hidden" name="id" value={category.id} />
        <h2>Sửa thể loại</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên thể loại</label>
            <input id="name" name="name" defaultValue={category.name} required />
          </div>
          <div className="field">
            <label htmlFor="slug">Đường dẫn</label>
            <input id="slug" name="slug" defaultValue={category.slug} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả</label>
          <textarea id="description" name="description" defaultValue={category.description ?? ""} placeholder="Mô tả thể loại" />
        </div>
        <button className="button button-primary" type="submit">
          Lưu thay đổi
        </button>
      </form>
    </main>
  );
}
