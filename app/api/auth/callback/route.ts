import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@/lib/supabase/server";

function getSafeNextUrl(next: string | null, requestUrl: string) {
  const fallback = new URL("/", requestUrl);
  if (!next?.startsWith("/") || next.startsWith("//")) return fallback;
  try {
    // 역슬래시나 제어 문자는 URL 해석 시 달라질 수 있어 최종 출처까지 비교한다.
    const destination = new URL(next, requestUrl);
    return destination.origin === fallback.origin ? destination : fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeNextUrl(request.nextUrl.searchParams.get("next"), request.url);
  const oauthError = request.nextUrl.searchParams.get("error");

  // 취소·실패 응답에 코드가 함께 있어도 세션 교환을 시도하지 않는다.
  if (code && !oauthError) {
    try {
      const supabase = await createServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(next);
    } catch {
      // 네트워크 예외도 코드 만료와 동일하게 로그인 화면에서 재시도하도록 안내한다.
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", oauthError === "access_denied" ? "oauth_cancelled" : "oauth_callback_failed");
  return NextResponse.redirect(loginUrl);
}
