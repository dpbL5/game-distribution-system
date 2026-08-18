import { adminService } from "@/modules/admin/infrastructure/admin-service";
import { setUserStatusAction } from "@/modules/admin/presentation/actions";
import { StatusBadge } from "@/shared/ui/status-badge";
import { formatStatus } from "@/shared/utils/format-status";

export default async function AdminUsersPage() {
  const users = await adminService.users();
  return (
    <main className="stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">TRUY CẬP</span>
          <h1>Người dùng</h1>
          <p className="lede">Vai trò và trạng thái tài khoản được kiểm soát tại máy chủ.</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th className="table-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.displayName ?? user.username}
                  <br />
                  <span className="muted small">{user.email}</span>
                </td>
                <td>
                  <StatusBadge tone={user.role === "ADMIN" ? "info" : "default"}>
                    {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                  </StatusBadge>
                </td>
                <td>
                  <StatusBadge tone={user.status === "LOCKED" ? "danger" : "success"}>
                    {formatStatus(user.status)}
                  </StatusBadge>
                </td>
                <td className="table-actions">
                  <form action={setUserStatusAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={user.status === "LOCKED" ? "ACTIVE" : "LOCKED"}
                    />
                    <button className="button button-secondary" type="submit">
                      {user.status === "LOCKED" ? "Mở khóa" : "Khóa"}
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
