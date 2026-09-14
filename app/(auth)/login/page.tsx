'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SignIn from '../_components/SignIn';
import { createClient } from '@/lib/supabase/client';
import { useToastMessageContext } from '@/providers/ToastMessageProvider';

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const { showToastMessage } = useToastMessageContext();

  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // 외부 로그인 화면에서 뒤로 오면 브라우저가 로딩 상태까지 복원하므로 해제한다.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsSigningIn(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);
  
  const error = searchParams.get('error');
  const message = error === 'oauth_cancelled'
    ? '카카오 로그인이 취소되었습니다. 다시 시도해 주세요.'
    : error === 'oauth_callback_failed'
      ? '로그인을 완료하지 못했습니다. 다시 시도해 주세요.'
      : null;
  const type = error === 'oauth_cancelled' ? 'warning' : 'error';

  useEffect(() => {
    if (!message || !type) return;
    // 개발 모드의 effect 재실행에서는 예약을 취소해 콜백 알림이 한 번만 표시되게 한다.
    const timer = setTimeout(() => {
      showToastMessage({ message, type });
      // 처리한 결과는 URL에서 지워 새로고침 시 같은 안내가 반복되지 않게 한다.
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState(window.history.state, '', url);
    }, 0);
    return () => clearTimeout(timer);
  }, [message, type, showToastMessage]);

  const signInWithKakao = async () => {
    setIsSigningIn(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: `${window.location.origin}/api/auth/callback` }
      });

      if (error) throw error;
    } catch {
      showToastMessage({ type: 'error', message: "카카오 로그인에 연결하지 못했습니다. 다시 시도해 주세요." });
      setIsSigningIn(false);
    }
  };

  return <SignIn isSigningIn={isSigningIn} onSignIn={signInWithKakao} />;
}
