// @vitest-environment jsdom
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BaseButton from './BaseButton';
import IconButton from './IconButton';

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
});

describe('공용 버튼', () => {
    it('내용과 아이콘을 표시하고 클릭 이벤트 및 ref를 전달한다', async () => {
        const onClick = vi.fn();
        const ref = createRef<HTMLButtonElement>();
        await act(async () => root.render(
            <BaseButton ref={ref} onClick={onClick} aria-label="항목 추가" leftIcon={<span>왼쪽</span>} rightIcon={<span>오른쪽</span>}>추가</BaseButton>
        ));
        const button = host.querySelector('button')!;
        expect(button.textContent).toBe('왼쪽추가오른쪽');
        expect(button.getAttribute('aria-label')).toBe('항목 추가');
        expect(ref.current).toBe(button);
        await act(async () => button.click());
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it.each([{ disabled: true }, { isLoading: true }])('비활성 또는 로딩 상태에서 클릭을 차단한다: %o', async (state) => {
        const onClick = vi.fn();
        await act(async () => root.render(<BaseButton {...state} onClick={onClick}>실행</BaseButton>));
        const button = host.querySelector('button')!;
        expect(button.disabled).toBe(true);
        await act(async () => button.click());
        expect(onClick).not.toHaveBeenCalled();
        if ('isLoading' in state) expect(button.textContent).toContain('로딩중');
        await act(async () => root.render(<BaseButton onClick={onClick}>실행</BaseButton>));
        expect(button.textContent).toBe('실행');
        await act(async () => button.click());
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('기본적으로 폼을 제출하지 않고 submit 지정 시에만 제출한다', async () => {
        const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
        await act(async () => root.render(<form onSubmit={onSubmit}><BaseButton>실행</BaseButton></form>));
        await act(async () => host.querySelector('button')!.click());
        expect(onSubmit).not.toHaveBeenCalled();
        await act(async () => root.render(<form onSubmit={onSubmit}><BaseButton type="submit">실행</BaseButton></form>));
        await act(async () => host.querySelector('button')!.click());
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('아이콘 버튼에 접근 가능한 이름을 부여하고 로딩 중 클릭을 차단한다', async () => {
        const onClick = vi.fn();
        await act(async () => root.render(<IconButton icon="×" label="닫기" onClick={onClick} />));
        const button = host.querySelector('button')!;
        expect(button.getAttribute('aria-label')).toBe('닫기');
        expect(button.type).toBe('button');
        expect(button.querySelector('[aria-hidden="true"]')?.textContent).toBe('×');
        await act(async () => button.click());
        expect(onClick).toHaveBeenCalledTimes(1);
        await act(async () => root.render(<IconButton icon="×" label="닫기" onClick={onClick} isLoading />));
        await act(async () => button.click());
        expect(button.disabled).toBe(true);
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
