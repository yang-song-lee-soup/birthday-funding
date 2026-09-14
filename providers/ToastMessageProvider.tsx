'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ToastMessageProps, ToastMessageContextType } from '@/types/toastMessage';

const ToastMessageContext = createContext<ToastMessageContextType | null>(null);

export function ToastMessageProvider({ children }: { children: React.ReactNode }) {
    const [toastMessages, setToastMessages] = useState<ToastMessageProps[]>([]);
    const activeMessages = useRef(new Map<string, string>());
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

    useEffect(() => {
        // Provider가 사라지면 예약된 상태 갱신과 중복 확인 기록을 함께 정리
        const currentTimers = timers.current;
        const currentMessages = activeMessages.current;
        return () => {
            currentTimers.forEach(clearTimeout);
            currentTimers.clear();
            currentMessages.clear();
        };
    }, []);

    const removeToastMessage = useCallback((id: string) => {
        // 직접 닫기와 자동 제거가 같은 정리 경로를 사용하도록 타이머도 해제
        clearTimeout(timers.current.get(id));
        timers.current.delete(id);
        activeMessages.current.delete(id);
        setToastMessages((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToastMessage = useCallback(({ message, type }: Omit<ToastMessageProps, 'id'>) => {
        // 상태 반영 전 연속 호출도 막기 위해 ref에 즉시 기록한다. 유형이 다르면 별도 알림
        const key = JSON.stringify([type, message]);
        if (Array.from(activeMessages.current.values()).includes(key)) return;
        const id = crypto.randomUUID();
        activeMessages.current.set(id, key);
        setToastMessages((prev) => [...prev, { id, message, type }]);
        timers.current.set(id, setTimeout(() => removeToastMessage(id), 3000));
    }, [removeToastMessage]);

    return (
        <ToastMessageContext.Provider value={{ toastMessages, showToastMessage, removeToastMessage }}>
            {children}
        </ToastMessageContext.Provider>
    );
}

export function useToastMessageContext() {
    const context = useContext(ToastMessageContext);
    if (!context) throw new Error('useToastMessageContext must be used within ToastMessageProvider');
    return context;
}
