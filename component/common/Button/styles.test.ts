import { describe, expect, it } from 'vitest';

import { getButtonClassName } from './styles';

describe('getButtonClassName', () => {
    it('uses the primary design token by default', () => {
        expect(getButtonClassName({})).toContain('bg-primary');
    });

    it('supports the Kakao button and loading state', () => {
        const className = getButtonClassName({ color: 'kakao', isLoading: true, className: 'w-full' });

        expect(className).toContain('bg-kakao');
        expect(className).toContain('cursor-wait');
        expect(className).toContain('w-full');
    });
});
