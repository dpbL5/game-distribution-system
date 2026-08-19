import Link from "next/link";
import { notFound } from "next/navigation";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { deleteDeveloperAction, updateDeveloperAction } from "@/modules/admin/presentation/actions";

export default async function AdminDeveloperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const developer = await adminService.getDeveloper(id);
  if (!developer) notFound();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <Link href="/admin/developers" className="muted small">
            ← Quay lại nhà phát triển
          </Link>
          <h1>{developer.name}</h1>
        </div>
        <form action={deleteDeveloperAction}>
          <input type="hidden" name="id" value={developer.id} />
          <button className="button button-danger" type="submit">
            Xóa
          </button>
        </form>
      </div>
      <form className="panel stack" action={updateDeveloperAction}>
        <input type="hidden" name="id" value={developer.id} />
        <h2>Sửa nhà phát triển</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên</label>
            <input id="name" name="name" defaultValue={developer.name} required />
          </div>
          <div className="field">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" defaultValue={developer.website ?? ""} placeholder="https://..." />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả</label>
          <textarea id="description" name="description" defaultValue={developer.description ?? ""} placeholder="Mô tả nhà phát triển" />
        </div>
        <button className="button button-primary" type="submit">
          Lưu thay đổi
        </button>
      </form>
    </main>
  );
}
