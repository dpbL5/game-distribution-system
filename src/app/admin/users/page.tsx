import { adminService } from "@/modules/admin/infrastructure/admin-service";
import {
  deleteUserAction,
  setUserStatusAction,
  updateUserAction,
} from "@/modules/admin/presentation/actions";
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
          <p className="lede">Sửa tên hiển thị/vai trò, khóa/mở và xóa tài khoản (chặn xóa khi đã có đơn hàng và không tự xóa).</p>
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
                  <form className="stack" action={updateUserAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="field">
                      <label htmlFor={`user-display-${user.id}`}>Tên hiển thị</label>
                      <input id={`user-display-${user.id}`} name="displayName" defaultValue={user.displayName} required />
                    </div>
                    <div className="field">
                      <label htmlFor={`user-role-${user.id}`}>Vai trò</label>
                      <select id={`user-role-${user.id}`} name="role" defaultValue={user.role}>
                        <option value="CUSTOMER">Khách hàng</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </div>
                    <div className="muted small">{user.username} · {user.email}</div>
                    <button className="button button-secondary" type="submit">
                      Lưu
                    </button>
                  </form>
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
                  <div className="form-actions">
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
                    <form action={deleteUserAction}>
                      <input type="hidden" name="userId" value={user.id} />
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
