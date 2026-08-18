import Link from "next/link";

import { LoginForm } from "@/modules/auth/presentation/auth-forms";

export default function LoginPage() {
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <span className="eyebrow">TRUY CẬP TÀI KHOẢN</span>
        <h1>Đăng nhập</h1>
        <LoginForm />
        <Link href="/forgot-password">Quên mật khẩu?</Link>
      </section>
    </main>
  );
}
