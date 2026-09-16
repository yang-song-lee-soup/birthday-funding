'use client';

import AuthProvider from './AuthProvider';
import { ToastMessageProvider } from './ToastMessageProvider';

type ProvidersProps = {
    children: React.ReactNode;
};

/**
 * 전역 Provider 관리 컴포넌트
 *
 * 특징:
 * 1. 관심사 분리: 각 Provider를 독립적인 파일로 관리
 * 2. 순서 보장: AuthProvider가 인증 안내에 Toast를 사용하므로 ToastMessageProvider를 바깥에 배치
 * 3. 단일 진실 공급원: 모든 Provider를 한 곳에서 관리
 * 
 * 추후 조회 api 추가 시 QueryProvider... 등 추가
 *
 */

export default function Providers({ children }: ProvidersProps) {
    return (
        <ToastMessageProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </ToastMessageProvider>
    );
}
