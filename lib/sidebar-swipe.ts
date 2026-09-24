export function sidebarSwipeDirection(dx: number, dy: number): "right" | "cancel" | "pending" {
  if (Math.abs(dy) > 14 && Math.abs(dy) >= Math.abs(dx)) return "cancel"
  if (dx < -14) return "cancel"
  if (dx >= 24 && dx > Math.abs(dy) * 1.8) return "right"
  return "pending"
}
export function completesSidebarSwipe(dx: number, dy: number) {
  return dx >= 72 && dx > Math.abs(dy) * 1.8
}
