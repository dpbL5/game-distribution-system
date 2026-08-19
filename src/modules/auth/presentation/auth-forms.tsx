"use client";

import { useActionState } from "react";

import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from "./actions";
import { initialAuthActionState } from "./action-state";

function FormMessage({ error, success }: { error: string | null; success: string | null }) {
  if (error)
    return (
      <p className="form-message form-message-error" role="alert">
        {error}
      </p>
    );
  if (success)
    return (
      <p className="form-message form-message-success" role="status">
        {success}
      </p>
    );
  return null;
}

function SubmitButton({ children, pending }: { children: React.ReactNode; pending: boolean }) {
  return (
    <button
      className="button button-primary"
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-disabled={pending}
    >
      {pending ? "Đang xử lý…" : children}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialAuthActionState);
  return (
    <form className="stack" action={action}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="field">
        <label htmlFor="email">Email hoặc tên đăng nhập</label>
        <input id="email" name="email" type="text" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <FormMessage {...state} />
      <SubmitButton pending={pending}>Đăng nhập</SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialAuthActionState);
  return (
    <form className="stack" action={action}>
      <div className="field">
        <label htmlFor="username">Tên người dùng</label>
        <input id="username" name="username" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="displayName">Tên hiển thị</label>
        <input id="displayName" name="displayName" autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Mật khẩu</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required />
        <small>Tối thiểu 12 ký tự, gồm chữ hoa, chữ thường và số.</small>
      </div>
      <FormMessage {...state} />
      <SubmitButton pending={pending}>Tạo tài khoản</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState,
  );
  return (
    <form className="stack" action={action}>
      <div className="field">
        <label htmlFor="email">Email tài khoản</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <FormMessage {...state} />
      <SubmitButton pending={pending}>Gửi hướng dẫn</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initialAuthActionState);
  return (
    <form className="stack" action={action}>
      <div className="field">
        <label htmlFor="token">Mã khôi phục</label>
        <input id="token" name="token" autoComplete="one-time-code" required />
      </div>
      <div className="field">
        <label htmlFor="password">Mật khẩu mới</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <FormMessage {...state} />
      <SubmitButton pending={pending}>Đặt lại mật khẩu</SubmitButton>
    </form>
  );
}
