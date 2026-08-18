import Link from "next/link";

import { userService } from "@/modules/user/infrastructure/user-service";
import { updateProfileAction } from "@/modules/user/presentation/actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await userService.profile();
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <div className="form-card-title">
          <span className="eyebrow">TÀI KHOẢN / HỒ SƠ</span>
          <h1>{profile.displayName}</h1>
          <p className="muted">{profile.email}</p>
        </div>
        <form className="stack" action={updateProfileAction}>
          <div className="field">
            <label htmlFor="displayName">Tên hiển thị</label>
            <input
              id="displayName"
              name="displayName"
              defaultValue={profile.displayName}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="countryCode">Mã quốc gia</label>
            <input
              id="countryCode"
              name="countryCode"
              defaultValue={profile.countryCode ?? ""}
              maxLength={2}
              placeholder="VD: VN"
            />
          </div>
          <button className="button button-primary" type="submit">
            Lưu hồ sơ
          </button>
        </form>
        <Link href="/profile/security">Bảo mật tài khoản</Link>
      </section>
    </main>
  );
}
