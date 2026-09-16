"use client";

import { useEffect, type ReactNode } from "react";

import BaseButton from "@/component/common/Button/BaseButton";
import { useAuthContext } from "@/providers/AuthProvider";

/**
 * 보호 영역의 클라이언트 인증 UX 경계: 공통 로딩·조회 오류·재시도를 렌더링한다.
 * 비로그인 상태에서는 별도 Toast 없이 Provider에 이동을 위임하며 서버 Layout·API 검증은 별도로 유지한다.
 */
export default function AuthBoundary({ children }: { children: ReactNode }) {
  const { isLogin, isLoading, authError, refetchUser, handleUnauthenticated } = useAuthContext();

  useEffect(() => {
    if (isLoading || authError) return;
    if (!isLogin) handleUnauthenticated();
  }, [isLogin, isLoading, authError, handleUnauthenticated]);

  if (isLoading && !isLogin) {
    return (
      <div className="grid min-h-dvh w-full flex-1 place-items-center" aria-busy="true">
        <svg
          className="size-[32px] text-primary motion-safe:animate-spin"
          viewBox="0 0 24 24"
          role="status"
          aria-label="로그인 상태를 확인하고 있습니다."
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  const errorNotice = authError ? (
      <section className="p-8" role="alert">
        <p>사용자 정보를 확인하지 못했습니다. 다시 시도해 주세요.</p>
        <BaseButton className="mt-5" color="gray" isLoading={isLoading} onClick={() => void refetchUser()}>
          다시 시도
        </BaseButton>
      </section>
    ) : null;

  if (!isLogin) return errorNotice;

  // 갱신 중에도 같은 위치에 children을 유지해 페이지 입력·로컬 상태를 보존한다.
  return <>{children}{errorNotice}</>;
}
