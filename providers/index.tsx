'use client';

import AuthProvider from './AuthProvider';

type ProvidersProps = {
    accessToken?: string;
    children: React.ReactNode;
};

export default function Providers({ accessToken, children }: ProvidersProps) {
    return <AuthProvider accessToken={accessToken}>{children}</AuthProvider>;
}
