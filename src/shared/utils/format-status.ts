const labels: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  ARCHIVED: "Đã lưu trữ",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
  DRAFT: "Bản nháp",
  FAILED: "Thất bại",
  HIDDEN: "Đã ẩn",
  INACTIVE: "Ngừng hoạt động",
  LOCKED: "Đã khóa",
  PAID: "Đã thanh toán",
  PAYMENT_FAILED: "Thanh toán thất bại",
  PENDING: "Đang chờ",
  PENDING_PAYMENT: "Chờ thanh toán",
  PUBLISHED: "Đã phát hành",
  REFUNDED: "Đã hoàn tiền",
  STOPPED: "Đã dừng",
  SUCCEEDED: "Thành công",
  VISIBLE: "Hiển thị",
};

export function formatStatus(status: string): string {
  return labels[status] ?? status;
}
