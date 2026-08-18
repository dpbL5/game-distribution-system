import { ResetPasswordForm } from "@/modules/auth/presentation/auth-forms";

export default function ResetPasswordPage() {
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <span className="eyebrow">KHÔI PHỤC</span>
        <h1>Đặt lại mật khẩu</h1>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
