import { describe, expect, it } from 'vitest';
import { AppError, extractError } from './app-error';

describe('AppError', () => {
    const payload = {
        service: 'product',
        error: 'HTTP_ERROR',
        status: 404,
        message: '상품을 찾지 못했습니다.',
    };

    it('필드와 JSON 직렬화 결과를 유지한다', () => {
        const error = new AppError(payload);

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('AppError');
        expect(error.message).toBe(payload.message);
        expect(error.service).toBe(payload.service);
        expect(error.error).toBe(payload.error);
        expect(error.status).toBe(payload.status);
        expect(error.toJSON()).toEqual(payload);
    });

    it('AppError는 JSON 형태로 추출한다', () => {
        expect(extractError(new AppError(payload))).toEqual(payload);
    });

    it('일반 Error는 INTERNAL_ERROR로 추출한다', () => {
        expect(extractError(new Error('network'))).toEqual({
            service: 'unknown',
            status: 500,
            message: 'network',
            error: 'INTERNAL_ERROR',
        });
    });

    it('알 수 없는 값은 UNKNOWN_ERROR로 추출한다', () => {
        expect(extractError('fail')).toEqual({
            service: 'unknown',
            status: 500,
            message: 'Unknown Error',
            error: 'UNKNOWN_ERROR',
        });
    });
});
