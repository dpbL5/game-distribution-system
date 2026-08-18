import Link from "next/link";

import { changePasswordAction } from "@/modules/user/presentation/actions";

export default function ProfileSecurityPage() {
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <div className="form-card-title">
          <span className="eyebrow">TÀI KHOẢN / BẢO MẬT</span>
          <h1>Đổi mật khẩu</h1>
        </div>
        <form className="stack" action={changePasswordAction}>
          <div className="field">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="field">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input id="newPassword" name="newPassword" type="password" required />
            <small>Tối thiểu 12 ký tự, gồm chữ hoa, chữ thường và số.</small>
          </div>
          <button className="button button-primary" type="submit">
            Cập nhật mật khẩu
          </button>
        </form>
        <Link href="/profile">Quay lại hồ sơ</Link>
      </section>
    </main>
  );
}
