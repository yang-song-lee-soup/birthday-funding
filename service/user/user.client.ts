"use client";

import { AppError, extractError } from "@/lib/app/app-error";
import type { ServiceResult } from "@/lib/app/app-result";
import type {
  UserFriendDetail,
  UserFriendList,
  UserFriendsErrorResponse,
} from "./user.interface";

export class UserBrowserClient {
  async fetchFriends(offset: number): Promise<ServiceResult<UserFriendList>> {
    try {
      const url = new URL("/api/user/friends", window.location.origin);
      url.searchParams.set("offset", String(offset));

      const response = await fetch(url, { cache: "no-store" });
      const data = (await response.json()) as UserFriendList | UserFriendsErrorResponse;

      if (!response.ok) {
        const error = data as UserFriendsErrorResponse;
        throw new AppError({
          service: "user",
          error: error.code ?? "KAKAO_FRIENDS_REQUEST_FAILED",
          status: response.status,
          message: error.message ?? "친구 목록을 불러오지 못했습니다. 다시 시도해 주세요.",
        });
      }

      return [data as UserFriendList, null];
    } catch (error) {
      return [null, extractError(error)];
    }
  }

  async fetchFriend(friendId: string, kakaoUserId: number): Promise<ServiceResult<UserFriendDetail>> {
    try {
      const url = new URL(
        `/api/user/friends/${encodeURIComponent(friendId)}`,
        window.location.origin,
      );
      url.searchParams.set("kakaoUserId", String(kakaoUserId));
      const response = await fetch(url, { cache: "no-store" });
      const data = (await response.json()) as UserFriendDetail | UserFriendsErrorResponse;

      if (!response.ok) {
        const error = data as UserFriendsErrorResponse;
        throw new AppError({
          service: "user",
          error: error.code ?? "KAKAO_FRIENDS_REQUEST_FAILED",
          status: response.status,
          message: error.message ?? "친구 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
        });
      }

      return [data as UserFriendDetail, null];
    } catch (error) {
      return [null, extractError(error)];
    }
  }
}
