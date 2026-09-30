"use client";

import { useCallback } from "react";

import type { ErrorResponse } from "@/lib/app/app-error";
import { useAuthContext } from "@/providers/AuthProvider";

export default function useUserRequestRecovery() {
  const {
    completeKakaoReconnect,
    reconnectWithKakao,
    signOut,
  } = useAuthContext();

  const recoverUserRequest = useCallback(async (error: ErrorResponse) => {
    if (error.error === "KAKAO_AUTHORIZATION_EXPIRED") {
      await reconnectWithKakao();
      return true;
    }

    if (error.status === 401) {
      await signOut({ isSessionExpired: true });
      return true;
    }

    return false;
  }, [reconnectWithKakao, signOut]);

  return { completeKakaoReconnect, recoverUserRequest };
}
