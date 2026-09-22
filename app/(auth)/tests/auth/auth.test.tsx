// @vitest-environment jsdom
import { act, StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthSessionMissingError } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({
    signInWithOAuth: vi.fn(), signOut: vi.fn(), getUser: vi.fn(),
    getRequestUser: vi.fn(),
    onAuthStateChange: vi.fn((handler: (event: string, session: unknown) => void) => {
        handler('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    replace: vi.fn(), refresh: vi.fn(), redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }),
}));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: mocks }) }));
vi.mock('@/service/auth/auth.server', () => ({ getRequestUser: mocks.getRequestUser }));
vi.mock('next/navigation', () => ({
    useRouter: () => mocks,
    usePathname: () => window.location.pathname,
    redirect: mocks.redirect,
    useSearchParams: () => new URLSearchParams(window.location.search),
}));
import LoginPage from '@/app/(auth)/login/page';
import ProtectedLayout from '@/app/(protected)/layout';
import AuthLayout from '@/app/(auth)/layout';
import UserPage from '@/app/(protected)/user/page';
import AuthProvider, { useAuthContext } from '@/providers/AuthProvider';
import AuthBoundary from '@/app/(protected)/_component/AuthBoundary';
import { ToastMessageProvider } from '@/providers/ToastMessageProvider';
import ToastMessageContainer from '@/component/common/ToastMessage/ToastMessageContainer';

let host: HTMLDivElement;
let root: Root;
function renderScreen(screen: ReactNode) {
    root.render(
        <StrictMode>
            <ToastMessageProvider>
                <AuthProvider>{screen}<ToastMessageContainer /></AuthProvider>
            </ToastMessageProvider>
        </StrictMode>,
    );
}
beforeEach(() => {
    vi.clearAllMocks();
    mocks.onAuthStateChange.mockImplementation((handler) => {
        handler('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    vi.useFakeTimers();
    window.history.replaceState(null, '', '/login');
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('인증 화면과 접근 제어', () => {
    it('같은 유저의 세션 갱신은 Context만 갱신하고 유저가 바뀔 때만 서버를 새로고침한다', async () => {
        window.history.replaceState(null, '', '/');
        mocks.onAuthStateChange.mockImplementation((handler) => {
            handler('INITIAL_SESSION', { user: { id: 'user', user_metadata: {} } });
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });
        function Probe() {
            const { userInfo } = useAuthContext();
            return <span data-name>{userInfo.displayName}</span>;
        }
        await act(async () => renderScreen(<Probe />));
        const handler = mocks.onAuthStateChange.mock.calls.at(-1)![0];
        for (const event of ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED']) {
            await act(async () => handler(event, { user: { id: 'user', user_metadata: { name: event } } }));
            expect(host.querySelector('[data-name]')?.textContent).toBe(event);
        }
        expect(mocks.refresh).not.toHaveBeenCalled();
        await act(async () => handler('SIGNED_IN', { user: { id: 'other', user_metadata: { name: 'other' } } }));
        expect(mocks.refresh).toHaveBeenCalledTimes(1);
        expect(host.querySelector('[data-name]')?.textContent).toBe('other');
        await act(async () => handler('SIGNED_OUT', null));
        expect(mocks.refresh).toHaveBeenCalledTimes(1);
    });
    it('사용자 표시 정보는 Provider에서 초기화·재조회·변경·로그아웃에 따라 갱신된다', async () => {
        mocks.onAuthStateChange.mockImplementation((handler) => {
            handler('INITIAL_SESSION', { user: { id: 'user', user_metadata: { full_name: '초기 이름' } } });
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });
        mocks.getUser.mockResolvedValue({
            data: { user: { id: 'user', user_metadata: { name: '변경 이름', avatar_url: 'https://example.com/avatar.png' } } },
            error: null,
        });
        mocks.signOut.mockResolvedValue({ error: null });
        function Probe() {
            const { userInfo, refetchUser, signOut } = useAuthContext();
            return <>
                <span data-name>{userInfo.displayName}</span>
                <span data-avatar>{userInfo.avatarUrl ?? ''}</span>
                <button data-refetch onClick={() => void refetchUser()}>refetch</button>
                <button data-signout onClick={() => void signOut()}>signout</button>
            </>;
        }
        await act(async () => renderScreen(<Probe />));
        expect(host.querySelector('[data-name]')?.textContent).toBe('초기 이름');
        await act(async () => host.querySelector<HTMLButtonElement>('[data-refetch]')!.click());
        expect(host.querySelector('[data-name]')?.textContent).toBe('변경 이름');
        expect(host.querySelector('[data-avatar]')?.textContent).toBe('https://example.com/avatar.png');
        await act(async () => mocks.onAuthStateChange.mock.calls.at(-1)![0](
            'USER_UPDATED', { user: { id: 'user', user_metadata: {} } },
        ));
        expect(host.querySelector('[data-name]')?.textContent).toBe('unknown');
        expect(host.querySelector('[data-avatar]')?.textContent).toBe('');
        await act(async () => host.querySelector<HTMLButtonElement>('[data-signout]')!.click());
        expect(host.querySelector('[data-name]')?.textContent).toBe('unknown');
        expect(host.querySelector('[data-avatar]')?.textContent).toBe('');
    });
    it('인증 요청 도중 세션 이벤트가 와도 로딩과 버튼 비활성화를 유지한다', async () => {
        let resolveUser!: (value: unknown) => void;
        mocks.getUser.mockImplementation(() => new Promise((resolve) => { resolveUser = resolve; }));
        function Probe() {
            const { isLoading, refetchUser, signOut } = useAuthContext();
            return <>
                <span data-loading>{String(isLoading)}</span>
                <button data-refetch disabled={isLoading} onClick={() => refetchUser()}>refetch</button>
                <button data-signout disabled={isLoading} onClick={() => signOut()}>signout</button>
            </>;
        }
        await act(async () => renderScreen(<Probe />));
        await act(async () => host.querySelector<HTMLButtonElement>('[data-refetch]')!.click());
        await act(async () => {
            mocks.onAuthStateChange.mock.calls.at(-1)![0]('TOKEN_REFRESHED', null);
            host.querySelector<HTMLButtonElement>('[data-refetch]')!.click();
            host.querySelector<HTMLButtonElement>('[data-signout]')!.click();
        });
        expect(host.querySelector('[data-loading]')?.textContent).toBe('true');
        expect(host.querySelector<HTMLButtonElement>('[data-refetch]')!.disabled).toBe(true);
        expect(mocks.getUser).toHaveBeenCalledTimes(1);
        expect(mocks.signOut).not.toHaveBeenCalled();
        await act(async () => resolveUser({ data: { user: null }, error: null }));
        expect(host.querySelector('[data-loading]')?.textContent).toBe('false');
    });

    it('정상 로그아웃 이벤트는 만료 안내 없이 성공 안내와 이동만 한 번 처리한다', async () => {
        window.history.replaceState(null, '', '/user');
        mocks.onAuthStateChange.mockImplementation((handler) => {
            handler('INITIAL_SESSION', { user: { id: 'user', user_metadata: {} } });
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });
        mocks.signOut.mockImplementation(async () => {
            mocks.onAuthStateChange.mock.calls.at(-1)![0]('SIGNED_OUT', null);
            return { error: null };
        });
        await act(async () => renderScreen(<AuthBoundary><UserPage /></AuthBoundary>));
        await act(async () => host.querySelector('button')!.click());
        expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/login');
        expect(host.querySelector('[role="status"]')?.textContent).toContain('로그아웃 되었습니다.');
        expect(host.textContent).not.toContain('다시 로그인해 주세요.');
    });

    it('비로그인 상태는 별도 Toast 없이 로그인 화면으로 이동한다', async () => {
        await act(async () => renderScreen(<AuthBoundary>private</AuthBoundary>));
        expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/login');
        expect(host.querySelector('[role="status"]')?.textContent).toBe('');
        expect(host.querySelector('button[aria-label="알림 닫기"]')).toBeNull();
        expect(host.querySelector('[role="alert"]')?.textContent).toBe('');
        expect(host.textContent).not.toContain('private');
    });
    it('콜백 주소로 카카오 로그인을 요청하고 중복 클릭을 막는다', async () => {
        mocks.signInWithOAuth.mockResolvedValue({ error: null });
        await act(async () => renderScreen(<LoginPage />));
        await act(async () => host.querySelector('button')!.click());
        expect(mocks.signInWithOAuth).toHaveBeenCalledWith({ provider: 'kakao', options: { redirectTo: `${window.location.origin}/api/auth/callback`, scopes: 'friends' } });
        expect(host.querySelector('button')!.disabled).toBe(true);
    });

    it('카카오 화면에서 뒤로 돌아오면 로딩을 해제하고 다시 로그인할 수 있다', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null }, error: new AuthSessionMissingError() });
        mocks.signInWithOAuth.mockResolvedValue({ error: null });
        await act(async () => renderScreen(<LoginPage />));
        await act(async () => host.querySelector('button')!.click());
        expect(host.querySelector('button')!.disabled).toBe(true);

        // 최초 표시 이벤트는 진행 중 요청을 풀지 않고, 뒤로가기 캐시 복원만 처리한다.
        await act(async () => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false })));
        expect(host.querySelector('button')!.disabled).toBe(true);
        await act(async () => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
        expect(host.querySelector('button')!.disabled).toBe(false);
        expect(host.querySelector('button')!.textContent).toContain('카카오로 시작하기');
        expect(host.querySelector('[role="alert"]')?.textContent).toBe('');
        await act(async () => host.querySelector('button')!.click());
        expect(mocks.signInWithOAuth).toHaveBeenCalledTimes(2);
    });

    it('로그인 후 클라이언트 뒤로가기로 로그인 화면에 돌아오면 홈으로 대체 이동한다', async () => {
        window.history.replaceState(null, '', '/');
        mocks.onAuthStateChange.mockImplementation((handler) => {
            handler('INITIAL_SESSION', { user: { id: 'user', user_metadata: {} } });
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });
        await act(async () => renderScreen(<UserPage />));
        expect(mocks.replace).not.toHaveBeenCalled();
        window.history.replaceState(null, '', '/login');
        await act(async () => renderScreen(<LoginPage />));
        expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/');
    });

    it('OAuth 이전 로그인 화면이 캐시에서 복원되면 최신 유저를 조회하고 홈으로 이동한다', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'user', user_metadata: {} } }, error: null });
        await act(async () => renderScreen(<LoginPage />));
        await act(async () => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
        expect(mocks.getUser).toHaveBeenCalledTimes(1);
        expect(mocks.replace).toHaveBeenCalledWith('/');
    });

    it.each(['response', 'throw'])('재조회에서 세션 없음(%s)을 확인하면 오류 화면 없이 로그인으로 이동한다', async (kind) => {
        window.history.replaceState(null, '', '/user');
        mocks.onAuthStateChange.mockImplementation((handler) => {
            handler('INITIAL_SESSION', { user: { id: 'user', user_metadata: {} } });
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });
        const error = new AuthSessionMissingError();
        if (kind === 'response') mocks.getUser.mockResolvedValue({ data: { user: null }, error });
        else mocks.getUser.mockRejectedValue(error);
        function Probe() {
            const { refetchUser, isLogin, authError } = useAuthContext();
            return <>
                <button data-refetch onClick={() => void refetchUser()}>refetch</button>
                <span data-auth>{String(isLogin)}:{authError?.message ?? ''}</span>
                <AuthBoundary>private</AuthBoundary>
            </>;
        }
        await act(async () => renderScreen(<Probe />));
        await act(async () => host.querySelector<HTMLButtonElement>('[data-refetch]')!.click());
        expect(host.querySelector('[data-auth]')?.textContent).toBe('false:');
        expect(mocks.replace).toHaveBeenCalledExactlyOnceWith('/login');
        expect(host.textContent).not.toContain('private');
        expect(host.querySelector('[role="alert"]')?.textContent).toBe('');
        expect(host.querySelector('[role="status"]')?.textContent).toBe('');
    });

    it('재조회 네트워크 오류는 비로그인으로 처리하지 않고 기존 유저와 오류를 유지한다', async () => {
        window.history.replaceState(null, '', '/user');
        mocks.onAuthStateChange.mockImplementation((handler) => {
            handler('INITIAL_SESSION', { user: { id: 'user', user_metadata: {} } });
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });
        mocks.getUser.mockRejectedValue(new Error('network'));
        function Probe() {
            const { refetchUser, isLogin, authError } = useAuthContext();
            return <>
                <button data-refetch onClick={() => void refetchUser()}>refetch</button>
                <span data-auth>{String(isLogin)}:{authError?.message ?? ''}</span>
                <AuthBoundary>private</AuthBoundary>
            </>;
        }
        await act(async () => renderScreen(<Probe />));
        await act(async () => host.querySelector<HTMLButtonElement>('[data-refetch]')!.click());
        expect(host.querySelector('[data-auth]')?.textContent).toBe('true:network');
        expect(mocks.replace).not.toHaveBeenCalled();
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('다시 시도해 주세요.');
    });

    it('네트워크 오류가 발생하면 안내를 표시하고 재시도를 허용한다', async () => {
        mocks.signInWithOAuth.mockRejectedValue(new Error('network'));
        await act(async () => renderScreen(<LoginPage />));
        await act(async () => host.querySelector('button')!.click());
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('다시 시도');
        expect(host.querySelector('button')!.disabled).toBe(false);
    });

    it.each(['oauth_cancelled', 'oauth_callback_failed'])('콜백 결과에 맞는 안내를 표시한다: %s', async (error) => {
        window.history.replaceState(null, '', `/login?error=${error}&from=shared`);
        await act(async () => renderScreen(<LoginPage />));
        await act(async () => vi.advanceTimersByTime(0));
        const role = error === 'oauth_cancelled' ? 'status' : 'alert';
        expect(host.querySelector(`[role="${role}"]`)?.textContent).toContain(error === 'oauth_cancelled' ? '취소' : '완료하지 못했습니다');
        expect(host.querySelectorAll('button[aria-label="알림 닫기"]')).toHaveLength(1);
        expect(window.location.search).toBe('?from=shared');
        await act(async () => vi.advanceTimersByTime(3000));
        expect(host.querySelector(`[role="${role}"]`)?.textContent).toBe('');
    });

    it('로그아웃에 성공하면 로그인 화면으로 이동하고 세션을 갱신한다', async () => {
        mocks.signOut.mockResolvedValue({ error: null });
        await act(async () => renderScreen(<UserPage />));
        await act(async () => host.querySelector('button')!.click());
        expect(mocks.replace).toHaveBeenCalledWith('/login');
        expect(mocks.refresh).toHaveBeenCalled();
        expect(host.querySelector('[role="status"]')?.textContent).toContain('로그아웃 되었습니다.');
        expect(host.querySelectorAll('button[aria-label="알림 닫기"]')).toHaveLength(1);
        await act(async () => renderScreen(<LoginPage />));
        expect(host.querySelector('[role="status"]')?.textContent).toContain('로그아웃 되었습니다.');
        expect(host.querySelectorAll('button[aria-label="알림 닫기"]')).toHaveLength(1);
        await act(async () => vi.advanceTimersByTime(3000));
        expect(host.querySelectorAll('button[aria-label="알림 닫기"]')).toHaveLength(0);
    });

    it('로그아웃에 실패하면 현재 화면에서 재시도를 허용한다', async () => {
        mocks.signOut.mockRejectedValue(new Error('network'));
        await act(async () => renderScreen(<UserPage />));
        await act(async () => host.querySelector('button')!.click());
        expect(mocks.replace).not.toHaveBeenCalled();
        expect(host.querySelector('[role="alert"]')?.textContent).toContain('로그아웃에 실패했습니다');
        expect(host.querySelector('button')!.disabled).toBe(false);
    });

    it('비로그인 사용자를 로그인 화면으로 보내고 인증된 사용자만 접근을 허용한다', async () => {
        mocks.getRequestUser.mockResolvedValue(null);
        await expect(ProtectedLayout({ children: 'private' })).rejects.toThrow('redirect:/login');
        mocks.getRequestUser.mockResolvedValue({ id: 'user', user_metadata: {} });
        expect(await ProtectedLayout({ children: 'private' })).toBeTruthy();
        await expect(AuthLayout({ children: 'login' })).rejects.toThrow('redirect:/');
    });
});
