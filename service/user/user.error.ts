import "server-only";

import { AppError } from "@/lib/app/app-error";
import { KakaoApiError } from "@/lib/kakao/kakao.error";

const TESTER_REQUIRED_MESSAGE = "현재 앱 개발/테스트 단계 앱으로 카카오톡 친구 목록은 테스트 멤버끼리만 확인할 수 있습니다. 앱 관리자에게 테스트 멤버 추가를 요청한 뒤 다시 시도해 주세요.";
export const AUTHORIZATION_EXPIRED_MESSAGE = "Kakao authorization has expired. Please sign in again.";

export function userError(error: string, status: number, message: string) {
  return new AppError({ service: "user", error, status, message });
}

export function normalizeFriendError(error: unknown): never {
  if (!(error instanceof KakaoApiError)) {
    throw userError("KAKAO_FRIENDS_REQUEST_FAILED", 502, "Failed to reach Kakao.");
  }

  switch (error.kind) {
    case "INVALID_TOKEN":
      throw userError("KAKAO_AUTHORIZATION_EXPIRED", 401, AUTHORIZATION_EXPIRED_MESSAGE);
    case "ADDITIONAL_CONSENT_REQUIRED":
      throw userError("KAKAO_ADDITIONAL_CONSENT_REQUIRED", 403, "Kakao friends permission is required.");
    case "PERMISSION_REQUIRED":
      throw userError("KAKAO_TESTER_REQUIRED", 403, TESTER_REQUIRED_MESSAGE);
    case "RATE_LIMITED":
      throw userError("KAKAO_RATE_LIMITED", 429, "Kakao request limit has been exceeded.");
    default:
      throw userError("KAKAO_FRIENDS_REQUEST_FAILED", 502, "Failed to load Kakao friends.");
  }
}

export function normalizeBirthdayError(error: unknown): never {
  if (error instanceof KakaoApiError && error.kind === "RATE_LIMITED") {
    throw userError("KAKAO_RATE_LIMITED", 429, "Kakao request limit has been exceeded.");
  }

  throw userError("KAKAO_FRIENDS_REQUEST_FAILED", 502, "Failed to load Kakao friend birthdays.");
}

export function normalizeUserDetailError(error: unknown): never {
  if (error instanceof KakaoApiError) {
    if (error.kind === "NOT_REGISTERED_USER") {
      throw userError("USER_FRIEND_NOT_FOUND", 404, "Friend not found.");
    }
    if (error.kind === "RATE_LIMITED") {
      throw userError("KAKAO_RATE_LIMITED", 429, "Kakao request limit has been exceeded.");
    }
  }

  throw userError("KAKAO_FRIENDS_REQUEST_FAILED", 502, "Failed to load Kakao friend details.");
}
