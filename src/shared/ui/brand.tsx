import { Gamepad2 } from "lucide-react";
import Link from "next/link";

type BrandProps = {
  href?: string;
  label?: string;
};

export function Brand({ href = "/", label = "PlayPort" }: BrandProps) {
  return (
    <Link className="brand" href={href} aria-label={`${label} — trang chủ`}>
      <span className="brand-mark" aria-hidden="true">
        <Gamepad2 size={19} strokeWidth={2.25} />
      </span>
      <span className="brand-name">{label}</span>
    </Link>
  );
}
