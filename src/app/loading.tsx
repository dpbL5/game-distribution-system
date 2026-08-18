export default function Loading() {
  return (
    <main className="state-page" aria-busy="true" aria-live="polite">
      <div className="state-card">
        <p className="eyebrow">PLAYPORT</p>
        <h1>Đang tải</h1>
        <p>Đang chuẩn bị dữ liệu cho bạn.</p>
        <div className="loading-line" aria-hidden="true" />
      </div>
    </main>
  );
}
