import "server-only";

import { cache } from "react";

import { createServerClient } from "@/lib/supabase/server";

/**
 * 현재 HTTP 요청의 쿠키를 사용하는 서버 인증 조회 계층.
 * 사용자 검증은 getRequestUser로 수행하며 React 서버 렌더링 내 중복 조회는 cache로 줄인다.
 * server-only로 브라우저 사용을 차단한다. redirect/401 등 응답 정책은 Layout·API가 결정한다.
 */

export const getRequestUser = cache(async () => {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/** 세션 토큰 조회용. 저장된 세션 자체를 인증 근거로 삼지 말고 getRequestUser로 별도 검증한다. */
export const getCurrentSession = cache(async () => {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
});

/** 요청자 검증 후 외부 OAuth 제공자 API에 사용할 토큰을 반환한다. */
export async function getProviderToken() {
  const user = await getRequestUser();
  if (!user) return null;

  const session = await getCurrentSession();
  return session?.provider_token ?? null;
}
