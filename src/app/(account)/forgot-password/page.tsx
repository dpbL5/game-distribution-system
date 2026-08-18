import { ForgotPasswordForm } from "@/modules/auth/presentation/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <span className="eyebrow">KHÔI PHỤC</span>
        <h1>Quên mật khẩu</h1>
        <p className="muted">Yêu cầu mã đặt lại mật khẩu sử dụng một lần.</p>
        <ForgotPasswordForm />
      </section>
    </main>
  );
}
