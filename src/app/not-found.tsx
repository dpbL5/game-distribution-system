import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="state-page" aria-labelledby="not-found-title">
      <div className="state-card">
        <span className="state-icon" aria-hidden="true">
          <Compass size={26} strokeWidth={2.25} />
        </span>
        <p className="eyebrow">PLAYPORT / 404</p>
        <h1 id="not-found-title">Không tìm thấy trang</h1>
        <p>Đường dẫn này không còn tồn tại hoặc nội dung chưa được phát hành.</p>
        <Link className="button button-primary" href="/">
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
