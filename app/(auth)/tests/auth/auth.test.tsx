// @vitest-environment jsdom
import { act, StrictMode, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    signInWithOAuth: vi.fn(), signOut: vi.fn(), getUser: vi.fn(),
    replace: vi.fn(), refresh: vi.fn(), redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }),
}));
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: mocks }) }));
vi.mock('@/lib/supabase/server', () => ({ createServerClient: async () => ({ auth: mocks }) }));
vi.mock('next/navigation', () => ({
    useRouter: () => mocks,
    redirect: mocks.redirect,
    useSearchParams: () => new URLSearchParams(window.location.search),
}));
import LoginPage from '@/app/(auth)/login/page';
import UserPage from '@/app/(protected)/user/page';
import ProtectedLayout from '@/app/(protected)/layout';
import AuthLayout from '@/app/(auth)/layout';
import { ToastMessageProvider } from '@/providers/ToastMessageProvider';
import ToastMessageContainer from '@/component/common/ToastMessage/ToastMessageContainer';

let host: HTMLDivElement;
let root: Root;
function renderScreen(screen: ReactNode) {
    root.render(<StrictMode><ToastMessageProvider>{screen}<ToastMessageContainer /></ToastMessageProvider></StrictMode>);
}
beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    window.history.replaceState(null, '', '/login');
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.useRealTimers(); });

describe('인증 화면과 접근 제어', () => {
    it('콜백 주소로 카카오 로그인을 요청하고 중복 클릭을 막는다', async () => {
        mocks.signInWithOAuth.mockResolvedValue({ error: null });
        await act(async () => renderScreen(<LoginPage />));
        await act(async () => host.querySelector('button')!.click());
        expect(mocks.signInWithOAuth).toHaveBeenCalledWith({ provider: 'kakao', options: { redirectTo: `${window.location.origin}/api/auth/callback` } });
        expect(host.querySelector('button')!.disabled).toBe(true);
    });

    it('카카오 화면에서 뒤로 돌아오면 로딩을 해제하고 다시 로그인할 수 있다', async () => {
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
        mocks.getUser.mockResolvedValue({ data: { user: null } });
        await expect(ProtectedLayout({ children: 'private' })).rejects.toThrow('redirect:/login');
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'user' } } });
        expect(await ProtectedLayout({ children: 'private' })).toBe('private');
        await expect(AuthLayout({ children: 'login' })).rejects.toThrow('redirect:/');
    });
});
