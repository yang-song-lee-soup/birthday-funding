"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BaseButton from "@/components/ui/Button/BaseButton";
import type { ServiceResult } from "@/lib/app/app-result";
import { useToastMessageContext } from "@/providers/ToastMessageProvider";
import { UserBrowserClient } from "@/service/user/user.client";
import type { UserFriend, UserFriendList } from "@/service/user/user.interface";
import useUserRequestRecovery from "../_hook/use-user-request-recovery";
import UserList from "./user-list";

type UserPageClientProps = {
  initialResult: ServiceResult<UserFriendList>;
};

export default function UserPageClient({ initialResult }: UserPageClientProps) {
  const [initialData, initialError] = initialResult;
  const { showToastMessage } = useToastMessageContext();
  const { completeKakaoReconnect, recoverUserRequest } = useUserRequestRecovery();
  const userClient = useMemo(() => new UserBrowserClient(), []);
  const handledInitialResult = useRef(false);
  const [friends, setFriends] = useState<UserFriend[]>(initialData?.friends ?? []);
  const [totalCount, setTotalCount] = useState(initialData?.totalCount ?? 0);
  const [nextOffset, setNextOffset] = useState(initialData?.nextOffset ?? 0);
  const [isLoadingFriends, setIsLoadingFriends] = useState(Boolean(initialError));
  const [friendLoadError, setFriendLoadError] = useState<string | null>(null);

  const applyFriendsResult = useCallback(async (
    [data, error]: ServiceResult<UserFriendList>,
    offset: number,
  ) => {
    try {
      if (error) {
        if (await recoverUserRequest(error)) return;
        throw new Error(error.message);
      }

      setFriends((current) => (offset === 0 ? data.friends : [...current, ...data.friends]));
      setTotalCount(data.totalCount);
      setNextOffset(data.nextOffset);
      completeKakaoReconnect();
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "친구 목록을 불러오지 못했습니다. 다시 시도해 주세요.";
      setFriendLoadError(message);
      showToastMessage({ type: "error", message });
    } finally {
      setIsLoadingFriends(false);
    }
  }, [showToastMessage, completeKakaoReconnect, recoverUserRequest]);

  useEffect(() => {
    if (handledInitialResult.current) return;
    handledInitialResult.current = true;

    if (!initialError) {
      completeKakaoReconnect();
      return;
    }

    let isActive = true;
    void recoverUserRequest(initialError).then((recovered) => {
      if (!isActive || recovered) return;

      setFriendLoadError(initialError.message);
      setIsLoadingFriends(false);
      showToastMessage({ type: "error", message: initialError.message });
    });

    return () => {
      isActive = false;
    };
  }, [completeKakaoReconnect, initialError, recoverUserRequest, showToastMessage]);

  const loadFriends = useCallback(async (offset: number) => {
    const result = await userClient.fetchFriends(offset);
    await applyFriendsResult(result, offset);
  }, [applyFriendsResult, userClient]);

  const retryLoadFriends = () => {
    setIsLoadingFriends(true);
    setFriendLoadError(null);
    void loadFriends(0);
  };

  const loadMoreFriends = () => {
    setIsLoadingFriends(true);
    void loadFriends(nextOffset);
  };

  return (
    <main className="min-h-dvh bg-background px-6 py-12">
      <div className="mx-auto w-full space-y-6">
        <header>
          <h1 className="text-heading-4">친구 목록</h1>
          <p className="mt-2 text-body-small text-content-muted">카카오톡 친구를 선택해 생일 펀딩을 시작해 보세요.</p>
        </header>

        <section className="rounded-surface border border-border bg-surface p-6 shadow-surface" aria-busy={isLoadingFriends}>
          <p className="text-body-small text-content-muted">친구 {totalCount}명</p>
          {friendLoadError ? (
            <div className="py-12 text-center" role="alert">
              <p className="text-body-medium text-content">{friendLoadError}</p>
              <BaseButton className="mt-5" color="gray" isLoading={isLoadingFriends} onClick={retryLoadFriends}>
                다시 시도
              </BaseButton>
            </div>
          ) : isLoadingFriends && friends.length === 0 ? (
            <p className="py-12 text-center text-content-muted">친구 목록을 불러오는 중입니다.</p>
          ) : (
            <UserList
              users={friends}
              totalCount={totalCount}
              isLoading={isLoadingFriends}
              onLoadMore={loadMoreFriends}
            />
          )}
        </section>
      </div>
    </main>
  );
}
