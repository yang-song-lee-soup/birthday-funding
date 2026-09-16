import { redirect } from "next/navigation";

import { getRequestUser } from "@/app/service/auth/server/auth.service";

/** 로그인 화면의 서버 진입 정책: 이미 인증된 요청자는 홈으로 이동시킨다. */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    const user = await getRequestUser();

    if (user) {
        redirect("/");
    }

    return (
        <main className="flex min-h-dvh flex-1 items-center justify-center px-8 py-12">
            <section className="w-full max-w-auth">{children}</section>
        </main>
    );
}
