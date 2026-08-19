import Link from "next/link";

import { LoginForm } from "@/modules/auth/presentation/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  return (
    <main className="main-shell">
      <section className="panel form-card stack">
        <span className="eyebrow">TRUY CẬP TÀI KHOẢN</span>
        <h1>Đăng nhập</h1>
        <LoginForm next={next} />
        <Link href="/forgot-password">Quên mật khẩu?</Link>
      </section>
    </main>
  );
}
