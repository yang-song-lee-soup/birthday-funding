import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { exchangeCodeForSession } = vi.hoisted(() => ({ exchangeCodeForSession: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
    createServerClient: async () => ({ auth: { exchangeCodeForSession } }),
}));
import { GET } from './route';

function request(params: Record<string, string>) {
    return new NextRequest(`https://app.example/api/auth/callback?${new URLSearchParams(params)}`);
}

describe('OAuth 콜백', () => {
    beforeEach(() => { exchangeCodeForSession.mockReset().mockResolvedValue({ error: null }); });

    it('인증 코드를 세션으로 교환하고 내부 이동 경로를 유지한다', async () => {
        const response = await GET(request({ code: 'valid', next: '/user?tab=profile#name' }));
        expect(exchangeCodeForSession).toHaveBeenCalledWith('valid');
        expect(response.headers.get('location')).toBe('https://app.example/user?tab=profile#name');
    });

    it.each(['https://evil.example', '//evil.example', '/\\evil.example', '/\t/evil.example', 'javascript:alert(1)'])(
        '외부 주소로의 이동을 차단한다: %s', async (next) => {
            const response = await GET(request({ code: 'valid', next }));
            expect(response.headers.get('location')).toBe('https://app.example/');
        }
    );

    it('로그인이 취소되면 코드를 교환하지 않고 취소 안내로 이동한다', async () => {
        const response = await GET(request({ error: 'access_denied', code: 'ignored' }));
        expect(exchangeCodeForSession).not.toHaveBeenCalled();
        expect(response.headers.get('location')).toBe('https://app.example/login?error=oauth_cancelled');
    });

    it('인증 코드가 없거나 거부되면 실패 안내로 이동한다', async () => {
        expect((await GET(request({}))).headers.get('location')).toContain('error=oauth_callback_failed');
        exchangeCodeForSession.mockResolvedValue({ error: new Error('expired') });
        expect((await GET(request({ code: 'expired' }))).headers.get('location')).toContain('error=oauth_callback_failed');
    });

    it('코드 교환 중 예외가 발생하면 로그인 화면으로 돌아간다', async () => {
        exchangeCodeForSession.mockRejectedValue(new Error('network'));
        expect((await GET(request({ code: 'valid' }))).headers.get('location')).toContain('error=oauth_callback_failed');
    });
});
