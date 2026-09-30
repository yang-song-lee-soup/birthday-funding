import {
  isAuthApiError,
  isAuthSessionMissingError,
  type User
} from "@supabase/supabase-js";

import type { AuthProfile } from "./auth.interface";

const KAKAO_RECONNECT_PARAM = "kakaoReconnect";
const KAKAO_RECONNECT_ATTEMPTED = "attempted";

/** 세션 부재와 유효하지 않은 인증 정보는 모두 정상적인 비인증 상태로 분류한다. */
export function isUnauthenticatedError(error: unknown) {
  return (
    isAuthSessionMissingError(error) ||
    (isAuthApiError(error) && error.status === 401)
  );
}

/** 현재 URL이 이미 Kakao 재연결을 거쳐 돌아온 요청인지 확인한다. */
export function hasAttemptedKakaoReconnect(search: string) {
  return new URLSearchParams(search).get(KAKAO_RECONNECT_PARAM) === KAKAO_RECONNECT_ATTEMPTED;
}

/** 재연결은 친구 목록·상세 경로로만 복귀시키고 기존 쿼리는 보존한다. */
export function getKakaoReconnectReturnPath(pathname: string, search: string) {
  const safePathname = pathname === "/user" || pathname.startsWith("/user/")
    ? pathname
    : "/user";
  const params = new URLSearchParams(search);
  params.set(KAKAO_RECONNECT_PARAM, KAKAO_RECONNECT_ATTEMPTED);
  return `${safePathname}?${params.toString()}`;
}

/** Kakao API 성공으로 연결 복구가 확인된 뒤 재시도 표식만 제거한다. */
export function getPathWithoutKakaoReconnect(
  pathname: string,
  search: string,
  hash = "",
) {
  const params = new URLSearchParams(search);
  params.delete(KAKAO_RECONNECT_PARAM);
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}${hash}`;
}

/** OAuth 콜백에서 user 영역의 Kakao 재연결 요청인지 확인한다. */
export function isKakaoReconnectUrl(url: URL) {
  return (
    (url.pathname === "/user" || url.pathname.startsWith("/user/")) &&
    hasAttemptedKakaoReconnect(url.search)
  );
}

/** 조회 없이 Supabase 사용자를 공통 표시 정보로 변환한다. Provider가 userInfo로 공유한다. */
export function getAuthProfile(user: User | null): AuthProfile {
  if (!user) return { displayName: "unknown", avatarUrl: undefined };

  const metadata = user.user_metadata;
  const displayName = [
    metadata.full_name,
    metadata.name,
    metadata.preferred_username,
    user.email
  ].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  ) ?? "unknown";
  const avatarUrl =
    typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined;

  return {
    displayName,
    avatarUrl
  };
}
