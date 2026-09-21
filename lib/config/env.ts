function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const env = {
  appOrigin: trimTrailingSlash(
    process.env.APP_ORIGIN ?? "http://localhost:3000"
  ),
  productApiOrigin: trimTrailingSlash(
    process.env.PRODUCT_API_ORIGIN ?? "https://dummyjson.com"
  ),
  kakaoApiOrigin: trimTrailingSlash(process.env.KAKAO_API_ORIGIN ?? "")
};
