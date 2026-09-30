"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import Avatar from "@/components/ui/Avatar/Avatar";
import { getButtonClassName } from "@/components/ui/Button/styles";
import type { ServiceResult } from "@/lib/app/app-result";
import { useToastMessageContext } from "@/providers/ToastMessageProvider";
import type { UserFriendDetail } from "@/service/user/user.interface";
import useUserRequestRecovery from "../_hook/use-user-request-recovery";
import FriendBirthday from "./FriendBirthday";

type UserDetailProps = {
  initialResult: ServiceResult<UserFriendDetail | null>;
};

export default function UserDetail({ initialResult }: UserDetailProps) {
  const [friend, error] = initialResult;
  const { showToastMessage } = useToastMessageContext();
  const { completeKakaoReconnect, recoverUserRequest } = useUserRequestRecovery();
  const handledInitialResult = useRef(false);

  useEffect(() => {
    if (handledInitialResult.current) return;
    handledInitialResult.current = true;

    if (!error) {
      completeKakaoReconnect();
      return;
    }

    void (async () => {
      if (await recoverUserRequest(error)) return;
      showToastMessage({ type: "error", message: error.message });
    })();
  }, [completeKakaoReconnect, error, recoverUserRequest, showToastMessage]);

  if (error) {
    const isRecovering = error.error === "KAKAO_AUTHORIZATION_EXPIRED" || error.status === 401;

    return (
      <main className="min-h-dvh bg-background px-6 py-12" aria-busy={isRecovering}>
        <p className="text-center text-body-medium text-content" role={isRecovering ? "status" : "alert"}>
          {isRecovering ? "카카오 연결을 확인하고 있습니다." : error.message}
        </p>
      </main>
    );
  }

  if (!friend) {
    return (
      <main className="min-h-dvh bg-background px-6 py-12">
        <p className="text-center text-body-medium text-content" role="alert">
          친구 정보를 찾을 수 없습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-6 py-12">
      <section className="mx-auto w-full rounded-surface border border-border bg-surface p-6 shadow-surface">
        <Link
          href="/user"
          className="inline-flex items-center text-heading-5 text-content"
          aria-label="친구 목록으로"
        >
          ←
        </Link>
        <div className="mt-8 flex items-center gap-5">
          <Avatar
            src={friend.avatarUrl}
            alt=""
            fallback={friend.displayName}
            size="md"
          />
          <div>
            <h1 className="text-heading-4">{friend.displayName}</h1>
            <FriendBirthday
              birthday={friend.birthday}
              birthdayType={friend.birthdayType}
              isLeapMonth={friend.isLeapMonth}
            />
          </div>
        </div>
        <Link
          href="/product"
          className={getButtonClassName({ color: "primary", className: "mt-8" })}
        >
          상품 담기
        </Link>
      </section>
    </main>
  );
}
