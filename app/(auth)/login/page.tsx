'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SignIn from '../_components/SignIn';
import { useAuthContext } from '@/providers/AuthProvider';
import { useToastMessageContext } from '@/providers/ToastMessageProvider';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { showToastMessage } = useToastMessageContext();
  const { isLoading, signInWithKakao } = useAuthContext();
  
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

  return <SignIn isLoading={isLoading} onSignIn={() => signInWithKakao()} />;
}
