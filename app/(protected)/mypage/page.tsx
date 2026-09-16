"use client";

import Link from "next/link";

import { useAuthContext } from "@/providers/AuthProvider";

export default function MyPage() {
  const { userInfo } = useAuthContext();
  const { displayName } = userInfo;

  return (
    <main className="min-h-dvh bg-background px-6 py-12">
      <div className="mx-auto w-full space-y-6">
        <header>
          <h1 className="text-heading-4">마이페이지</h1>
          <p className="mt-2 text-body-small text-content-muted">{displayName}님의 계정 정보와 펀딩 활동을 관리하는 공간입니다.</p>
        </header>
        <section className="rounded-surface border border-border bg-surface p-6 shadow-surface">
          <p className="text-body-medium">마이페이지 기능을 준비하고 있습니다.</p>
          <Link className="mt-5 inline-flex text-body-small underline underline-offset-4" href="/user">
            친구 목록으로 돌아가기
          </Link>
        </section>
      </div>
    </main>
  );
}
