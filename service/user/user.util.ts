import type { KakaoAccountDto, KakaoFriendDto, KakaoUserInfoDto } from "@/lib/kakao/kakao.dto";
import type { UserFriend, UserFriendDetail } from "./user.interface";

export function parseUserFriendsOffset(requestUrl: string) {
  const offset = Number(new URL(requestUrl).searchParams.get("offset") ?? "0");
  return Number.isInteger(offset) && offset >= 0 ? offset : null;
}

export function toUserFriend(
  friend: KakaoFriendDto,
  birthday?: KakaoAccountDto,
): UserFriend {
  return {
    id: friend.uuid,
    kakaoUserId: friend.id,
    displayName: friend.profile_nickname ?? "이름 없음",
    avatarUrl: friend.profile_thumbnail_image,
    isFavorite: friend.favorite ?? false,
    birthday: birthday?.birthday,
    birthdayType: birthday?.birthday_type,
    isLeapMonth: birthday?.is_leap_month,
  };
}

export function toUserFriendDetail(
  user: KakaoUserInfoDto,
  friendId: string,
): UserFriendDetail {
  const account = user.kakao_account;
  const profile = account?.profile;

  return {
    id: friendId,
    displayName: profile?.nickname ?? "이름 없음",
    avatarUrl: profile?.thumbnail_image_url ?? profile?.profile_image_url,
    birthday: account?.birthday,
    birthdayType: account?.birthday_type,
    isLeapMonth: account?.is_leap_month,
  };
}
