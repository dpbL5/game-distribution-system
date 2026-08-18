"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="state-page" aria-labelledby="error-title">
      <div className="state-card">
        <p className="eyebrow">PLAYPORT</p>
        <h1 id="error-title">Đã xảy ra lỗi</h1>
        <p>Không thể tải nội dung ngay lúc này. Vui lòng thử lại.</p>
        <button className="button button-primary" type="button" onClick={reset}>
          Thử lại
        </button>
      </div>
    </main>
  );
}
