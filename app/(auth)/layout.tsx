import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect("/");
    }

    return (
        <main className="flex min-h-dvh flex-1 items-center justify-center px-8 py-12">
            <section className="w-full max-w-auth">{children}</section>
        </main>
    );
}
