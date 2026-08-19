import Link from "next/link";
import { notFound } from "next/navigation";

import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { deletePublisherAction, updatePublisherAction } from "@/modules/admin/presentation/actions";

export default async function AdminPublisherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publisher = await adminService.getPublisher(id);
  if (!publisher) notFound();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <Link href="/admin/publishers" className="muted small">
            ← Quay lại nhà phát hành
          </Link>
          <h1>{publisher.name}</h1>
        </div>
        <form action={deletePublisherAction}>
          <input type="hidden" name="id" value={publisher.id} />
          <button className="button button-danger" type="submit">
            Xóa
          </button>
        </form>
      </div>
      <form className="panel stack" action={updatePublisherAction}>
        <input type="hidden" name="id" value={publisher.id} />
        <h2>Sửa nhà phát hành</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="name">Tên</label>
            <input id="name" name="name" defaultValue={publisher.name} required />
          </div>
          <div className="field">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" defaultValue={publisher.website ?? ""} placeholder="https://..." />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Mô tả</label>
          <textarea id="description" name="description" defaultValue={publisher.description ?? ""} placeholder="Mô tả nhà phát hành" />
        </div>
        <button className="button button-primary" type="submit">
          Lưu thay đổi
        </button>
      </form>
    </main>
  );
}
