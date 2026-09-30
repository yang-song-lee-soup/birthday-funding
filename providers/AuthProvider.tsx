'use client';

import type { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { AuthContextValue } from '@/service/auth/auth.interface';
import { AuthBrowserClient } from '@/service/auth/auth.client';
import {
    getAuthProfile,
    getKakaoReconnectReturnPath,
    getPathWithoutKakaoReconnect,
    hasAttemptedKakaoReconnect,
} from '@/service/auth/auth.util';
import type { ErrorResponse } from '@/lib/app/app-error';
import { useToastMessageContext } from './ToastMessageProvider';

type AuthProviderProps = {
    children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Context 접근과 Provider 누락 검사를 한 곳에서 처리한다. 비로그인 여부는 user/isLogin으로 구분한다. */
export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider.');
    }

    return context;
}

/**
 * 클라이언트 인증 상태(user/isLogin/isLoading/authError)와 표시용 userInfo를 관리·공유한다.
 * 인증 명령, 공통 로딩 상태, 결과 Toast와 경로 이동을 중앙에서 처리한다.
 * 브라우저 UI 상태를 관리하는 계층이며 서버의 요청자 인증·권한 검증을 대신하지 않는다.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();

    const authClient = useMemo(
        () => new AuthBrowserClient(),
        [],
    );

    const { showToastMessage } = useToastMessageContext();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<ErrorResponse | null>(null);
    const redirected = useRef(false);

    // 최신 사용자 조회에 성공하면 Context를 갱신한다. 조회 실패는 기존 사용자와 함께 오류로 보관한다.
    const refetchUser = useCallback(async () => {
        setIsLoading(true);
        const result = await authClient.fetchCurrentUser();

        const [currentUser, error] = result;

        if (error) {
            setAuthError(error);
        } else {
            setUser(currentUser);
            setAuthError(null);
        }

        setIsLoading(false);
        return result;
    }, [authClient]);

    useEffect(() => {
        let previousUserId: string | null = null;
        const subscription = authClient.onAuthStateChange((event, session) => {
            const currentUserId = session?.user.id ?? null;
            const userChanged = currentUserId !== previousUserId;
            previousUserId = currentUserId;
            if (session?.user) redirected.current = false;
            setUser(session?.user ?? null);
            setAuthError(null);
            // 초기 확인만 완료한다. 이후 세션 이벤트는 명령의 로딩 상태를 변경하지 않는다.
            if (event === 'INITIAL_SESSION') setIsLoading(false);

            // 초기 세션과 같은 유저의 갱신은 Context만 반영한다.
            // 인증 해제는 Boundary/로그아웃 명령이 이동과 서버 갱신을 담당한다.
            if (event !== 'INITIAL_SESSION' && currentUserId && userChanged) {
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [authClient, router]);

    // 클라이언트 뒤로가기로 로그인 화면에 돌아와도 인증된 유저는 홈으로 보낸다.
    useEffect(() => {
        if (pathname === '/login' && user && !isLoading) router.replace('/');
    }, [pathname, user, isLoading, router]);

    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (!event.persisted || window.location.pathname !== '/login') return;
            // OAuth 이전 화면의 캐시에는 user가 없을 수 있어 복원 시 최신 인증을 확인한다.
            void refetchUser();
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [refetchUser]);

    const startKakaoOAuth = useCallback(async (next?: string) => {
        setIsLoading(true);
        const callbackUrl = new URL('/api/auth/callback', window.location.origin);
        if (next) callbackUrl.searchParams.set('next', next);
        const result = await authClient.signInWithKakao(callbackUrl.toString());
        if (result[1]) setIsLoading(false);
        // 성공 시 외부 OAuth 화면으로 이동한다. 뒤로가기 복원에서는 로딩을 해제한다.
        return result;
    }, [authClient]);

    const signInWithKakao = useCallback(async () => {
        const result = await startKakaoOAuth();
        if (result[1]) {
            showToastMessage({ type: 'error', message: '카카오 로그인에 연결하지 못했습니다. 다시 시도해 주세요.' });
        }
        return result;
    }, [showToastMessage, startKakaoOAuth]);

    const signOut = useCallback(async ({ isSessionExpired = false }: { isSessionExpired?: boolean } = {}) => {
        setIsLoading(true);
        const result = await authClient.signOut();
        if (result[1]) {
            showToastMessage({ type: 'error', message: '로그아웃에 실패했습니다. 다시 시도해 주세요.' });
        } else {
            setUser(null);
            setAuthError(null);
            showToastMessage(isSessionExpired
                ? { type: 'warning', message: '인증 세션이 만료되었습니다. 다시 로그인해 주세요.' }
                : { type: 'success', message: '로그아웃 되었습니다.' });
            redirected.current = true;
            router.replace('/login');
            router.refresh();
        }
        setIsLoading(false);

        return result;
    }, [authClient, router, showToastMessage]);

    const reconnectWithKakao = useCallback(async () => {
        if (hasAttemptedKakaoReconnect(window.location.search)) {
            return signOut({ isSessionExpired: true });
        }

        const returnPath = getKakaoReconnectReturnPath(
            window.location.pathname,
            window.location.search,
        );
        const result = await startKakaoOAuth(returnPath);
        if (result[1]) await signOut({ isSessionExpired: true });
        return result;
    }, [signOut, startKakaoOAuth]);

    const completeKakaoReconnect = useCallback(() => {
        if (!hasAttemptedKakaoReconnect(window.location.search)) return;

        const cleanPath = getPathWithoutKakaoReconnect(
            window.location.pathname,
            window.location.search,
            window.location.hash,
        );
        window.history.replaceState(null, '', cleanPath);
    }, []);

    // 보호 영역의 비로그인 상태는 별도 안내 없이 이동하며 중복 이동을 방지한다.
    const handleUnauthenticated = useCallback(() => {
        if (isLoading || user || authError || redirected.current) return;
        redirected.current = true;
        router.replace('/login');
        router.refresh();
    }, [authError, isLoading, router, user]);

    const userInfo = useMemo(() => getAuthProfile(user), [user]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        userInfo,
        isLogin: user !== null,
        isLoading,
        authError,
        refetchUser,
        signInWithKakao,
        reconnectWithKakao,
        completeKakaoReconnect,
        signOut,
        handleUnauthenticated,
    }), [authError, isLoading, refetchUser, signInWithKakao, reconnectWithKakao, completeKakaoReconnect, signOut, handleUnauthenticated, user, userInfo]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
