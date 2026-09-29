import "server-only";

import type { User } from "@supabase/supabase-js";
import { cache } from "react";

import { createServerClient } from "@/lib/supabase/server";
import { isUnauthenticatedError } from "./auth.util";

/**
 * Server Component·Server Action·Route Handler 전용 인증 DAL이다.
 * 서버사이드는 앱 내부 Route Handler Supabase에 직접 접근해 불필요한 HTTP 왕복과 인증 정보 재전달을 피한다.
 * 요청 쿠키에서 매번 상태를 읽는 무상태 계층이므로 클래스로 인스턴스화하지 않고 모듈 수준 함수로 제공한다.
 * 모듈 수준 함수에 React cache를 적용해 같은 렌더링 요청의 조회를 공유하고,
 * 호출부마다 서비스 인스턴스를 만들 때 캐시가 분리되는 문제를 방지한다.
 */

/** Supabase Auth 서버에서 현재 요청의 사용자를 검증한다. 세션 없음만 비로그인으로 처리한다. */
export const getRequestUser = cache(async (): Promise<User | null> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (isUnauthenticatedError(error)) return null;
    throw error;
  }

  return data.user;
});

/** 검증되지 않은 세션이 인증 근거로 노출되지 않도록 모듈 내부에서만 사용한다. */
const getCurrentSession = cache(async () => {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;
  return data.session;
});

/** 요청자 검증 후 외부 OAuth 제공자 API에 사용할 토큰을 반환한다. */
export async function getProviderToken() {
  const user = await getRequestUser();
  if (!user) return null;

  const session = await getCurrentSession();
  return session?.provider_token ?? null;
}
