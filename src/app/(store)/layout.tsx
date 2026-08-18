import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { authService } from "@/modules/auth/infrastructure/auth-service";
import { logoutAction } from "@/modules/auth/presentation/actions";
import { Brand } from "@/shared/ui/brand";
import { StoreNavigation } from "@/shared/ui/store-navigation";

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await authService.currentUser();
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <StoreNavigation user={user ? { role: user.role } : null} />
          <div className="header-actions">
            <Link className="header-cart-link" href="/cart">
              Giỏ hàng
            </Link>
            {user ? (
              <>
                {user.role === "ADMIN" ? (
                  <Link className="header-admin-link" href="/admin">
                    <LayoutDashboard aria-hidden="true" size={17} />
                    Khu vực quản trị
                  </Link>
                ) : null}
                <Link className="header-profile-link" href="/profile">
                  {user.displayName}
                </Link>
                <form action={logoutAction}>
                  <button className="header-link-button" type="submit">
                    Đăng xuất
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link className="header-auth-primary" href="/login">
                  Đăng nhập
                </Link>
                <Link className="header-auth-secondary" href="/register">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
