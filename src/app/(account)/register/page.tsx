import { RegisterForm } from "@/modules/auth/presentation/auth-forms";

export default function RegisterPage() {
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <span className="eyebrow">NGƯỜI DÙNG MỚI</span>
        <h1>Tạo tài khoản</h1>
        <RegisterForm />
      </section>
    </main>
  );
}
