import { describe, expect, it } from 'vitest';
import { AppError } from './app-error';
import { toResult } from './app-result';

describe('toResult', () => {
    const payload = {
        service: 'product',
        error: 'HTTP_ERROR',
        status: 404,
        message: '상품을 찾지 못했습니다.',
    };

    it('성공하면 데이터와 null 튜플을 반환한다', async () => {
        const [data, error] = await toResult(Promise.resolve({ id: 1 }));

        expect(data).toEqual({ id: 1 });
        expect(error).toBeNull();
    });

    it('AppError는 JSON 형태로 담아 실패 튜플을 반환한다', async () => {
        const [data, error] = await toResult(
            Promise.reject(new AppError(payload)),
        );

        expect(data).toBeNull();
        expect(error).toEqual(payload);
    });

    it('일반 예외는 INTERNAL_ERROR로 담는다', async () => {
        const [data, error] = await toResult(
            Promise.reject(new Error('network')),
        );

        expect(data).toBeNull();
        expect(error).toEqual({
            service: 'unknown',
            status: 500,
            message: 'network',
            error: 'INTERNAL_ERROR',
        });
    });
});
