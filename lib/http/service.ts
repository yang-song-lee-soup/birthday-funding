import { env } from "@/lib/config/env";

export enum HttpService {
  APP = "APP",
  PRODUCT = "PRODUCT",
  KAKAO = "KAKAO"
}

const SERVICE_ORIGIN: Record<HttpService, string> = {
  [HttpService.APP]: env.appOrigin,
  [HttpService.PRODUCT]: env.productApiOrigin,
  [HttpService.KAKAO]: env.kakaoApiOrigin
};

export function getServiceOrigin(service: HttpService): string {
  const origin = SERVICE_ORIGIN[service];

  if (!origin) {
    throw new Error(`HttpService.${service} origin is not configured`);
  }

  return origin;
}
