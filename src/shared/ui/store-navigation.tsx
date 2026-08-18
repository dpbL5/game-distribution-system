"use client";

import {
  Gamepad2,
  Heart,
  House,
  Library,
  LayoutDashboard,
  LogIn,
  ReceiptText,
  ShoppingBag,
  UserRound,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationUser = { role: "CUSTOMER" | "ADMIN" } | null;

const desktopLinks = {
  GUEST: [{ href: "/games", label: "Cửa hàng", icon: Gamepad2 }],
  CUSTOMER: [
    { href: "/games", label: "Cửa hàng", icon: Gamepad2 },
    { href: "/library", label: "Thư viện", icon: Library },
    { href: "/wishlist", label: "Yêu thích", icon: Heart },
    { href: "/orders", label: "Đơn hàng", icon: ReceiptText },
  ],
  ADMIN: [
    { href: "/games", label: "Cửa hàng", icon: Gamepad2 },
    { href: "/library", label: "Thư viện", icon: Library },
    { href: "/wishlist", label: "Yêu thích", icon: Heart },
    { href: "/orders", label: "Đơn hàng", icon: ReceiptText },
    { href: "/admin", label: "Khu vực quản trị", icon: LayoutDashboard },
  ],
} as const;

const mobileLinks = {
  GUEST: [
    { href: "/", label: "Trang chủ", icon: House },
    { href: "/games", label: "Cửa hàng", icon: Gamepad2 },
    { href: "/cart", label: "Giỏ hàng", icon: ShoppingBag },
    { href: "/login", label: "Đăng nhập", icon: LogIn },
    { href: "/register", label: "Đăng ký", icon: UserPlus },
  ],
  CUSTOMER: [
    { href: "/", label: "Trang chủ", icon: House },
    { href: "/games", label: "Cửa hàng", icon: Gamepad2 },
    { href: "/library", label: "Thư viện", icon: Library },
    { href: "/cart", label: "Giỏ hàng", icon: ShoppingBag },
    { href: "/profile", label: "Tài khoản", icon: UserRound },
  ],
  ADMIN: [
    { href: "/", label: "Trang chủ", icon: House },
    { href: "/games", label: "Cửa hàng", icon: Gamepad2 },
    { href: "/admin", label: "Quản trị", icon: LayoutDashboard },
    { href: "/cart", label: "Giỏ hàng", icon: ShoppingBag },
    { href: "/profile", label: "Tài khoản", icon: UserRound },
  ],
} as const;

type LinkGroup = typeof desktopLinks.CUSTOMER;
type MobileGroup = typeof mobileLinks.CUSTOMER;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function StoreNavigation({ user }: { user: NavigationUser }) {
  const pathname = usePathname();
  const role = user ? (user.role === "ADMIN" ? "ADMIN" : "CUSTOMER") : "GUEST";
  const links: LinkGroup = desktopLinks[role];
  const mobile: MobileGroup = mobileLinks[role];

  return (
    <>
      <nav className="site-nav" aria-label="Điều hướng cửa hàng">
        {links.map(({ href, icon: Icon, label }) => (
          <Link
            className="site-nav-link"
            href={href}
            key={href}
            aria-current={isActivePath(pathname, href) ? "page" : undefined}
          >
            <Icon aria-hidden="true" size={17} strokeWidth={2} />
            {label}
          </Link>
        ))}
      </nav>

      <nav className="mobile-nav" aria-label="Điều hướng nhanh">
        {mobile.map(({ href, icon: Icon, label }) => (
          <Link
            className="mobile-nav-link"
            href={href}
            key={href}
            aria-current={isActivePath(pathname, href) ? "page" : undefined}
          >
            <Icon aria-hidden="true" size={20} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
