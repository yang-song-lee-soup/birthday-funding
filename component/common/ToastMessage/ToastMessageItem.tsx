'use client';

import IconButton from '@/component/common/Button/IconButton';
import { useToastMessageContext } from '@/providers/ToastMessageProvider';
import type { ToastMessageProps } from '@/types/toastMessage';

const typeStyles = {
    error: 'bg-error-700',
    success: 'bg-success-700',
    info: 'bg-info-700',
    warning: 'bg-warning-700',
};

export default function ToastMessageItem({ id, message, type }: ToastMessageProps) {
    const { removeToastMessage } = useToastMessageContext();
    return (
        <div className={`${typeStyles[type]} pointer-events-auto flex w-full items-center justify-between gap-4 rounded-surface p-4 pl-12 text-white shadow-surface motion-safe:animate-slideIn`}>
            <span className="min-w-0 break-words text-body-small">{message}</span>
            <IconButton
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>}
                label="알림 닫기"
                color="white"
                onClick={() => removeToastMessage(id)}
                className="shrink-0"
            />
        </div>
    );
}
