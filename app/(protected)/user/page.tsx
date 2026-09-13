"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BaseButton from "@/component/common/Button/BaseButton";
import { createClient } from "@/lib/supabase/client";

export default function UserPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setErrorMessage(null);
        setIsSigningOut(true);

        const { error } = await supabase.auth.signOut();
        if (error) {
            setErrorMessage(error.message);
            setIsSigningOut(false);
            return;
        }

        router.replace("/login");
        router.refresh();
    };

    return (
        <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-auth space-y-6 rounded-surface border border-border bg-surface p-8 shadow-surface">
                <h1 className="text-heading-4">User Page</h1>
                {errorMessage && <p className="text-body-small text-error">{errorMessage}</p>}
                <BaseButton className="w-full" color="gray" isLoading={isSigningOut} onClick={handleSignOut}>
                    로그아웃
                </BaseButton>
            </div>
        </main>
    );
}
