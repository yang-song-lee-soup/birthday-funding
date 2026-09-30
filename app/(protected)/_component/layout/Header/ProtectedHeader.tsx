"use client";

import Link from "next/link";

import Avatar from "@/components/ui/Avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu/DropdownMenu";
import { useAuthContext } from "@/providers/AuthProvider";

export default function ProtectedHeader() {
  const { userInfo, isLoading, signOut } = useAuthContext();
  const { displayName, avatarUrl } = userInfo;

  return (
    <header className="flex h-24 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <Link className="text-heading-6" href="/user">생일 펀딩</Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <button
              type="button"
              className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content"
              aria-label={`${displayName} 사용자 메뉴`}
            />
          )}
        >
          <Avatar src={avatarUrl} alt={`${displayName} 프로필`} fallback={displayName} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href="/mypage" />}
          >
            마이페이지
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isLoading}
            onClick={() => void signOut()}
            variant="destructive"
          >
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
