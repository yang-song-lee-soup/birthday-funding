import { redirect } from 'next/navigation';

import { getRequestUser } from '@/app/service/auth/server/auth.service';
import AuthBoundary from '@/app/(protected)/_component/AuthBoundary';

/** 보호 경로를 서버에서 렌더링하기 전에 요청자를 검증하고, 이후 클라이언트 상태 처리는 AuthBoundary에 맡긴다. */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const user = await getRequestUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <AuthBoundary>
            {children}
        </AuthBoundary>
    );
}
