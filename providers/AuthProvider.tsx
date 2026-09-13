'use client';

import type { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { createClient } from '@/lib/supabase/client';

type AuthProviderProps = {
    accessToken?: string;
    children: React.ReactNode;
};

export default function AuthProvider({ accessToken, children }: AuthProviderProps) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
            if (session?.access_token !== accessToken) {
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [accessToken, router, supabase]);

    return <>{children}</>;
}
