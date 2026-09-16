"use client";

import Link from "next/link";

import BaseButton from "@/component/common/Button/BaseButton";
import { useAuthContext } from "@/providers/AuthProvider";

export default function ProtectedHeader() {
  const { userInfo, isLoading, signOut } = useAuthContext();
  const { displayName, avatarUrl } = userInfo;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <Link className="text-heading-6" href="/user">생일 펀딩</Link>
      <div className="flex items-center gap-3">
        <Link
          href="/mypage"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content"
          aria-label={`${displayName}의 마이페이지로 이동`}
        >
          {avatarUrl ? (
            <img className="h-9 w-9 rounded-full bg-gray-100 object-cover" src={avatarUrl} alt="" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-body-small text-content-muted" aria-hidden="true">
              {displayName.slice(0, 1)}
            </span>
          )}
        </Link>
        <BaseButton color="gray" isLoading={isLoading} onClick={() => signOut()}>
          로그아웃
        </BaseButton>
      </div>
    </header>
  );
}
