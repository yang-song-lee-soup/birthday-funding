"use client";

import BaseButton from "@/component/common/Button/BaseButton";
import { useAuthContext } from "@/providers/AuthProvider";

export default function UserPage() {
    const { isLoading, signOut } = useAuthContext();

    return (
        <main className="flex min-h-dvh flex-1 items-center justify-center px-6 py-12">
            <div className="w-full max-w-auth space-y-6 rounded-surface border border-border bg-surface p-8 shadow-surface">
                <h1 className="text-heading-4">User Page</h1>
                <BaseButton className="w-full" color="gray" isLoading={isLoading} onClick={() => void signOut()}>
                    로그아웃
                </BaseButton>
            </div>
        </main>
    );
}
