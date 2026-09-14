"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BaseButton from "@/component/common/Button/BaseButton";
import { createClient } from "@/lib/supabase/client";
import { useToastMessageContext } from "@/providers/ToastMessageProvider";

export default function UserPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const { showToastMessage } = useToastMessageContext();

    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        setIsSigningOut(true);

        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch {
            showToastMessage({ type: 'error', message: "로그아웃에 실패했습니다. 다시 시도해 주세요." });
            setIsSigningOut(false);
            return;
        }

        showToastMessage({ type: 'success', message: '로그아웃 되었습니다.' });
        router.replace("/login");
        router.refresh();
    };

    return (
        <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-auth space-y-6 rounded-surface border border-border bg-surface p-8 shadow-surface">
                <h1 className="text-heading-4">User Page</h1>
                <BaseButton className="w-full" color="gray" isLoading={isSigningOut} onClick={handleSignOut}>
                    로그아웃
                </BaseButton>
            </div>
        </main>
    );
}
