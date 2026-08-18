import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { setReviewVisibilityAction } from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatStatus } from "@/shared/utils/format-status";

export default async function AdminReviewsPage() {
  const reviews = await adminService.reviews();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">KIỂM DUYỆT</span>
          <h1>Đánh giá</h1>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Tác giả</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th className="table-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.gameName}</td>
                <td>{review.displayName}</td>
                <td>{review.content}</td>
                <td>
                  <StatusBadge tone={review.visibilityStatus === "HIDDEN" ? "warning" : "success"}>
                    {formatStatus(review.visibilityStatus)}
                  </StatusBadge>
                </td>
                <td className="table-actions">
                  <form action={setReviewVisibilityAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input
                      type="hidden"
                      name="visibilityStatus"
                      value={review.visibilityStatus === "HIDDEN" ? "VISIBLE" : "HIDDEN"}
                    />
                    <button className="button button-secondary" type="submit">
                      {review.visibilityStatus === "HIDDEN" ? "Hiện" : "Ẩn"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
