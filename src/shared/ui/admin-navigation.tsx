"use client";

import {
  BadgePercent,
  BarChart3,
  Boxes,
  Building2,
  FolderTree,
  Gamepad2,
  Gauge,
  MessagesSquare,
  PackageCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminGroups = [
  {
    label: "Vận hành",
    links: [
      { label: "Tổng quan", href: "/admin", icon: Gauge },
      { label: "Báo cáo", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Danh mục",
    links: [
      { label: "Game", href: "/admin/games", icon: Gamepad2 },
      { label: "Thể loại", href: "/admin/categories", icon: FolderTree },
      { label: "Nhà phát triển", href: "/admin/developers", icon: Boxes },
      { label: "Nhà phát hành", href: "/admin/publishers", icon: Building2 },
      { label: "Khuyến mãi", href: "/admin/promotions", icon: BadgePercent },
    ],
  },
  {
    label: "Khách hàng",
    links: [
      { label: "Người dùng", href: "/admin/users", icon: UsersRound },
      { label: "Đơn hàng", href: "/admin/orders", icon: PackageCheck },
      { label: "Đánh giá", href: "/admin/reviews", icon: MessagesSquare },
    ],
  },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Điều hướng quản trị">
      {adminGroups.map((group) => (
        <div key={group.label}>
          <span className="admin-nav-label">{group.label}</span>
          {group.links.map(({ label, href, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              aria-current={isActivePath(pathname, href) ? "page" : undefined}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
