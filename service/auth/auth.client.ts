"use client";

import {
  type AuthChangeEvent,
  type Session,
  type User
} from "@supabase/supabase-js";

import { extractError } from "@/lib/app/app-error";
import type { ServiceResult } from "@/lib/app/app-result";
import { createClient } from "@/lib/supabase/client";
import { isUnauthenticatedError } from "./auth.util";

type SupabaseBrowserClient = ReturnType<typeof createClient>;
export type AuthApi = Pick<
  SupabaseBrowserClient["auth"],
  "getUser" | "signInWithOAuth" | "signOut" | "onAuthStateChange"
>;

export type AuthStateChangeHandler = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

/**
 * 브라우저 Supabase 인스턴스와 인증 명령을 한 곳에서 관리
 * 서버 요청의 인증 검증과는 별개로 클라이언트 표시 정보를 갱신 담당
 * Context 상태, Toast, 경로 이동은 AuthProvider가 담당한다.
 */
export class AuthBrowserClient {
  constructor(
    private readonly auth: AuthApi = createClient().auth
  ) {}

  /** 클라이언트 표시 정보를 최신화한다. 서버 요청의 인증 검증과는 별개다. */
  async fetchCurrentUser(): Promise<ServiceResult<User | null>> {
    try {
      const {
        data: { user },
        error
      } = await this.auth.getUser();

      if (error) throw error;
      return [user, null];
    } catch (error) {
      // 세션 없음은 조회 장애가 아니라 정상적인 비로그인 상태다.
      if (isUnauthenticatedError(error)) return [null, null];
      return [null, extractError(error)];
    }
  }

  async signInWithKakao(redirectTo: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo,
          scopes: "friends"
        }
      });

      if (error) throw error;
      return [undefined, null];
    } catch (error) {
      return [null, extractError(error)];
    }
  }

  async signOut(): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.auth.signOut();

      if (error) throw error;
      return [undefined, null];
    } catch (error) {
      return [null, extractError(error)];
    }
  }

  onAuthStateChange(handler: AuthStateChangeHandler) {
    return this.auth.onAuthStateChange(handler).data.subscription;
  }
}

export type { User };
