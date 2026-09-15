import { describe, expect, it } from 'vitest';
import { AppError } from '@/lib/app/app-error';
import { catchError } from './error';

describe('HTTP catchError', () => {
    it('성공 응답은 통과시킨다', async () => {
        await expect(catchError(new Response(null, { status: 200 }))).resolves.toBeUndefined();
    });

    it('실패 응답의 에러 본문을 AppError로 던진다', async () => {
        const response = new Response(
            JSON.stringify({
                service: 'product',
                error: 'NAVER_SHOP_FAILED',
                status: 502,
                message: '네이버 쇼핑 조회에 실패했습니다.',
            }),
            { status: 502, statusText: 'Bad Gateway' },
        );

        await expect(catchError(response)).rejects.toSatisfy((error: unknown) => {
            expect(error).toBeInstanceOf(AppError);
            expect(error).toMatchObject({
                name: 'AppError',
                service: 'product',
                error: 'NAVER_SHOP_FAILED',
                status: 502,
                message: '네이버 쇼핑 조회에 실패했습니다.',
            });
            return true;
        });
    });

    it('본문이 없거나 JSON이 아니면 HTTP 기본 에러로 던진다', async () => {
        const response = new Response('not-json', { status: 404, statusText: 'Not Found' });

        await expect(catchError(response)).rejects.toMatchObject({
            name: 'AppError',
            service: 'http',
            error: 'HTTP_ERROR',
            status: 404,
            message: 'Not Found',
        });
    });
});
