"use client";

import { useCallback, useEffect, useState } from "react";

import BaseButton from "@/component/common/Button/BaseButton";
import { useToastMessageContext } from "@/providers/ToastMessageProvider";

type Friend = {
  id: number;
  uuid: string;
  favorite?: boolean;
  profile_nickname?: string;
  profile_thumbnail_image?: string;
};

type FriendListResponse = {
  friends: Friend[];
  totalCount: number;
  nextOffset: number;
  message?: string;
};

export default function UserPage() {
  const { showToastMessage } = useToastMessageContext();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [friendLoadError, setFriendLoadError] = useState<string | null>(null);

  const loadFriends = useCallback(async (offset: number) => {
    // 최초 로딩은 초기 state가 이미 true이므로 effect 안에서 동기 setState를 하지 않는다.
    if (offset > 0) setIsLoadingFriends(true);
    setFriendLoadError(null);
    try {
      const response = await fetch(`/api/kakao/friends?offset=${offset}`, { cache: "no-store" });
      const data = (await response.json()) as FriendListResponse;
      if (!response.ok) throw new Error(data.message);

      setFriends((current) => (offset === 0 ? data.friends : [...current, ...data.friends]));
      setTotalCount(data.totalCount);
      setNextOffset(data.nextOffset);
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "친구 목록을 불러오지 못했습니다. 다시 시도해 주세요.";
      setFriendLoadError(message);
      showToastMessage({ type: "error", message });
    } finally {
      setIsLoadingFriends(false);
    }
  }, [showToastMessage]);

  useEffect(() => {
    loadFriends(0);
  }, [loadFriends]);

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
              <BaseButton className="mt-5" color="gray" isLoading={isLoadingFriends} onClick={() => loadFriends(0)}>
                다시 시도
              </BaseButton>
            </div>
          ) : isLoadingFriends && friends.length === 0 ? (
            <p className="py-12 text-center text-content-muted">친구 목록을 불러오는 중입니다.</p>
          ) : friends.length === 0 ? (
            <p className="py-12 text-center text-content-muted">표시할 카카오톡 친구가 없습니다.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {friends.map((friend) => (
                <li key={friend.uuid} className="flex items-center gap-3 py-3">
                  {friend.profile_thumbnail_image ? (
                    <img className="h-10 w-10 rounded-full bg-gray-100 object-cover" src={friend.profile_thumbnail_image} alt="" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-body-small text-content-muted" aria-hidden="true">
                      {(friend.profile_nickname ?? "?").slice(0, 1)}
                    </span>
                  )}
                  <span className="text-body-medium">{friend.profile_nickname ?? "이름 없음"}</span>
                  {friend.favorite && <span className="ml-auto text-body-small text-content-muted">즐겨찾기</span>}
                </li>
              ))}
            </ul>
          )}

          {friends.length < totalCount && (
            <BaseButton className="mt-5 w-full" color="gray" isLoading={isLoadingFriends} onClick={() => loadFriends(nextOffset)}>
              친구 더 보기
            </BaseButton>
          )}
        </section>
      </div>
    </main>
  );
}
