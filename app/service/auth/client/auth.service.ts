"use client";

import { isAuthSessionMissingError, type AuthChangeEvent, type Session, type User } from "@supabase/supabase-js";

import { extractError, type ServiceResult } from "@/lib/app/app-error";
import { createClient } from "@/lib/supabase/client";

type AuthStateChangeHandler = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

/**
 * 브라우저 세션을 사용하는 Supabase 인증 호출 계층.
 * 사용자 조회·로그인·로그아웃·세션 이벤트 구독을 제공하고 호출 오류는 ServiceResult로 반환한다.
 * Context 상태 갱신, Toast, 경로 이동은 AuthProvider의 책임이다.
 */
export class AuthService {
  private readonly supabase = createClient();

  /** 클라이언트 표시 정보를 최신화하기 위한 조회. 서버 요청의 인증 검증과는 별개다. */
  async fetchCurrentUser(): Promise<ServiceResult<User | null>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error) throw error;
      return [user, null];
    } catch (error) {
      // 세션 없음은 조회 장애가 아니라 정상적인 비로그인 상태다.
      if (isAuthSessionMissingError(error)) return [null, null];
      return [null, extractError(error)];
    }
  }

  async signInWithKakao(redirectTo: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo,
          scopes: "friends",
        },
      });

      if (error) throw error;
      return [undefined, null];
    } catch (error) {
      return [null, extractError(error)];
    }
  }

  async signOut(): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) throw error;
      return [undefined, null];
    } catch (error) {
      return [null, extractError(error)];
    }
  }

  onAuthStateChange(handler: AuthStateChangeHandler) {
    return this.supabase.auth.onAuthStateChange(handler).data.subscription;
  }
}

export type { User };
