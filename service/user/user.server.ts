import "server-only";

import type { KakaoFriendDto } from "@/lib/kakao/kakao.dto";
import { getKakaoFriends, getKakaoUser, getKakaoUserBirthdays } from "@/lib/kakao/kakao.server";
import { getProviderToken, getRequestUser } from "@/service/auth/auth.server";
import {
  AUTHORIZATION_EXPIRED_MESSAGE,
  normalizeBirthdayError,
  normalizeFriendError,
  normalizeUserDetailError,
  userError,
} from "./user.error";
import type { UserFriendDetail, UserFriendList } from "./user.interface";
import { toUserFriend, toUserFriendDetail } from "./user.util";

async function getFriendAccessToken() {
  const user = await getRequestUser();
  if (!user) throw userError("UNAUTHORIZED", 401, "Unauthorized.");

  const providerToken = await getProviderToken();
  if (!providerToken) {
    throw userError("KAKAO_AUTHORIZATION_EXPIRED", 401, AUTHORIZATION_EXPIRED_MESSAGE);
  }

  return providerToken;
}

async function getFriendPage(providerToken: string, offset: number) {
  try {
    return await getKakaoFriends(providerToken, offset);
  } catch (error) {
    normalizeFriendError(error);
  }
}

async function getFriendBirthdays(friends: KakaoFriendDto[]) {
  try {
    return await getKakaoUserBirthdays(friends.map((friend) => friend.id));
  } catch (error) {
    normalizeBirthdayError(error);
  }
}

export async function getCurrentUserFriends(offset: number): Promise<UserFriendList> {
  const providerToken = await getFriendAccessToken();

  // 친구 API에는 생일이 없고 Users API는 대상 ID가 필요하므로, 친구 목록을 먼저 조회한 뒤 생일을 병합한다.
  const result = await getFriendPage(providerToken, offset);

  const kakaoFriends = result.elements ?? [];
  const birthdayUsers = await getFriendBirthdays(kakaoFriends);

  const birthdayByUserId = new Map(
    birthdayUsers.map((birthdayUser) => [birthdayUser.id, birthdayUser.kakao_account]),
  );
  const friends = kakaoFriends.map((friend) => (
    toUserFriend(friend, birthdayByUserId.get(friend.id))
  ));

  return {
    friends,
    totalCount: result.total_count,
    nextOffset: offset + friends.length,
  };
}

export async function getCurrentUserFriend(
  friendId: string,
  kakaoUserId: number,
): Promise<UserFriendDetail | null> {
  const user = await getRequestUser();
  if (!user) throw userError("UNAUTHORIZED", 401, "Unauthorized.");

  try {
    const friend = await getKakaoUser(kakaoUserId);
    return toUserFriendDetail(friend, friendId);
  } catch (error) {
    normalizeUserDetailError(error);
  }
}
