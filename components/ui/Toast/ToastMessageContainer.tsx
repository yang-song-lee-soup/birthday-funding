'use client';

import ToastMessageItem from './ToastMessageItem';
import { useToastMessageContext } from '@/providers/ToastMessageProvider';

export default function ToastMessageContainer() {
    const { toastMessages } = useToastMessageContext();
    return (
        <div aria-label="알림" role="region" className="pointer-events-none fixed inset-x-0 bottom-8 z-50 mx-auto flex w-full max-w-app flex-col items-center gap-4 px-4">
              {/* 스크린 리더가 일반 알림은 읽던 내용 이후에, 오류는 우선 안내하도록 영역을 분리, 새 알림을 감지할 수 있도록 빈 상태에서도 두 영역을 유지한다. */}
            <div role="status" aria-live="polite" aria-atomic="false" className="flex w-full max-w-auth flex-col gap-4">
                {toastMessages.filter((toast) => toast.type !== 'error').map((toast) => <ToastMessageItem key={toast.id} {...toast} />)}
            </div>
            <div role="alert" aria-live="assertive" aria-atomic="false" className="flex w-full max-w-auth flex-col gap-4">
                {toastMessages.filter((toast) => toast.type === 'error').map((toast) => <ToastMessageItem key={toast.id} {...toast} />)}
            </div>
        </div>
    );
}
