export function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(Math.round(price * 1000)) + "원";
}
