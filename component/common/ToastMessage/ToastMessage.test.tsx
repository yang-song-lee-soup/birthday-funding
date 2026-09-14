// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ToastMessageProvider, useToastMessageContext } from '@/providers/ToastMessageProvider';
import ToastMessageContainer from './ToastMessageContainer';


function Trigger() {
    const { showToastMessage } = useToastMessageContext();
    return <button onClick={() => {
        // 리렌더링 전에 연속 호출해도 중복 알림이 생성되지 않는지 확인한다.
        showToastMessage({ message: '저장하지 못했습니다.', type: 'error' });
        showToastMessage({ message: '저장하지 못했습니다.', type: 'error' });
    }}>알림 표시</button>;
}

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.useRealTimers();
});

async function showToast() {
    await act(async () => root.render(<ToastMessageProvider><Trigger /><ToastMessageContainer /></ToastMessageProvider>));
    await act(async () => host.querySelector('button')!.click());
}

it('개발 환경이 아니어도 오류를 표시하고 중복을 막으며 3초 후 제거한다', async () => {
    await showToast();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('저장하지 못했습니다.');
    expect(host.querySelectorAll('button[aria-label="알림 닫기"]')).toHaveLength(1);
    await act(async () => vi.advanceTimersByTime(2999));
    expect(host.querySelector('button[aria-label="알림 닫기"]')).not.toBeNull();
    await act(async () => vi.advanceTimersByTime(1));
    expect(host.querySelector('button[aria-label="알림 닫기"]')).toBeNull();
});

it('직접 닫으면 타이머를 정리하고 같은 메시지를 다시 표시할 수 있다', async () => {
    await showToast();
    await act(async () => (host.querySelector('button[aria-label="알림 닫기"]') as HTMLButtonElement).click());
    expect(vi.getTimerCount()).toBe(0);
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('');
    await act(async () => host.querySelector('button')!.click());
    expect(host.querySelector('button[aria-label="알림 닫기"]')).not.toBeNull();
    await act(async () => root.render(null));
    expect(vi.getTimerCount()).toBe(0);
});

