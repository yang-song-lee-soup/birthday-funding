"use client";

import { useMemo, useState } from "react";

import BaseButton from "@/component/common/Button/BaseButton";
import { createClient } from "@/lib/supabase/client";

export default function SignIn() {
  const supabase = useMemo(() => createClient(), []);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signInWithKakao = async () => {
    setErrorMessage(null);
    setIsSigningIn(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` }
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="space-y-6 rounded-surface border border-border bg-surface p-8 shadow-surface">
      <div>
        <h1 className="text-heading-4">생일 펀딩</h1>
        <p className="mt-2 text-body-small text-content-muted">
          소중한 사람의 생일, 함께 축하하는 특별한 방법
        </p>
      </div>
      {errorMessage && (
        <p className="text-body-small text-error">{errorMessage}</p>
      )}
      <BaseButton
        className="w-full"
        size="lg"
        type="button"
        color="kakao"
        isLoading={isSigningIn}
        onClick={signInWithKakao}
      >
        카카오로 시작하기
      </BaseButton>
    </div>
  );
}
