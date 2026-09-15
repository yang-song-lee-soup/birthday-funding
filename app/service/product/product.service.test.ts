import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductService } from './product.service';
import type { ProductSearchResult } from './product.interface';

function jsonResponse(data: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        ...init,
    });
}

describe('상품 서비스', () => {
    const fetchMock = vi.fn();
    const result: ProductSearchResult = {
        total: 1,
        start: 1,
        display: 12,
        items: [{
            id: '1',
            title: '생일 케이크',
            image: 'https://example.com/cake.png',
            price: 20000,
            mallName: '네이버',
            category: '식품',
            link: 'https://example.com/cake',
        }],
    };

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('상품 목록을 조회하면 데이터와 함께 성공 튜플을 반환한다', async () => {
        fetchMock.mockResolvedValue(jsonResponse(result));
        const service = new ProductService();

        const [data, error] = await service.getAll({
            query: '케이크',
            display: 12,
            start: 1,
            sort: 'sim',
        });

        const url = fetchMock.mock.calls[0][0] as URL;
        expect(url.pathname).toBe('/api/product');
        expect(url.searchParams.get('query')).toBe('케이크');
        expect(url.searchParams.get('display')).toBe('12');
        expect(url.searchParams.get('start')).toBe('1');
        expect(url.searchParams.get('sort')).toBe('sim');
        expect(data).toEqual(result);
        expect(error).toBeNull();
    });

    it('HTTP 실패는 AppError JSON으로 치환해 실패 튜플을 반환한다', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(
                {
                    service: 'http',
                    error: 'HTTP_ERROR',
                    status: 502,
                    message: '네이버 쇼핑 조회에 실패했습니다.',
                },
                { status: 502, statusText: 'Bad Gateway' },
            ),
        );
        const service = new ProductService();

        const [data, error] = await service.getAll({ query: '케이크' });

        expect(data).toBeNull();
        expect(error).toEqual({
            service: 'http',
            error: 'HTTP_ERROR',
            status: 502,
            message: '네이버 쇼핑 조회에 실패했습니다.',
        });
    });

    it('네트워크 예외는 INTERNAL_ERROR로 추출한다', async () => {
        fetchMock.mockRejectedValue(new Error('network'));
        const service = new ProductService();

        const [data, error] = await service.getAll({ query: '케이크' });

        expect(data).toBeNull();
        expect(error).toEqual({
            service: 'unknown',
            status: 500,
            message: 'network',
            error: 'INTERNAL_ERROR',
        });
    });
});
