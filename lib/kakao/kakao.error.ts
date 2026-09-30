import type { KakaoErrorDto } from "./kakao.dto";

export type KakaoApiErrorKind =
  | "INVALID_TOKEN"
  | "ADDITIONAL_CONSENT_REQUIRED"
  | "PERMISSION_REQUIRED"
  | "RATE_LIMITED"
  | "UNDERAGE_NOT_ALLOWED"
  | "NOT_REGISTERED_USER"
  | "UNKNOWN";

export class KakaoApiError extends Error {
  constructor(
    readonly kind: KakaoApiErrorKind,
    readonly status: number,
    readonly providerCode?: number,
    readonly requiredScopes: string[] = [],
  ) {
    super(`Kakao API request failed: ${kind}`);
    this.name = "KakaoApiError";
  }
}

export function normalizeKakaoApiError(status: number, error: KakaoErrorDto) {
  switch (error.code) {
    case -401:
      return new KakaoApiError("INVALID_TOKEN", status, error.code);
    case -402:
      return new KakaoApiError(
        "ADDITIONAL_CONSENT_REQUIRED",
        status,
        error.code,
        error.required_scopes,
      );
    case -5:
      return new KakaoApiError("PERMISSION_REQUIRED", status, error.code);
    case -10:
      return new KakaoApiError("RATE_LIMITED", status, error.code);
    case -406:
      return new KakaoApiError("UNDERAGE_NOT_ALLOWED", status, error.code);
    case -101:
      return new KakaoApiError("NOT_REGISTERED_USER", status, error.code);
    default:
      return new KakaoApiError("UNKNOWN", status, error.code);
  }
}
