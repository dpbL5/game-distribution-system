import Link from "next/link";

export default function NotFound() {
  return (
    <main className="state-page" aria-labelledby="not-found-title">
      <div className="state-card">
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
