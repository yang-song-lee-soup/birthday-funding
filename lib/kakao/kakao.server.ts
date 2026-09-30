import "server-only";

import type {
  KakaoErrorDto,
  KakaoFriendsDto,
  KakaoUserInfoDto,
} from "./kakao.dto";
import { normalizeKakaoApiError } from "./kakao.error";
import {
  chunkKakaoUserIds,
  createKakaoFriendsUrl,
  createKakaoUserUrl,
  createKakaoUserBirthdayUrl,
  getKakaoAdminKey,
} from "./kakao.util";

/**
 * 로그인 사용자의 카카오톡 친구를 찾는 API다.
 * 친구 UUID·서비스 사용자 ID·프로필은 제공하지만 생일은 제공하지 않는다.
 */
export async function getKakaoFriends(accessToken: string, offset: number) {
  const url = createKakaoFriendsUrl(offset);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const payload = (await response.json()) as KakaoFriendsDto | KakaoErrorDto;

  if (!response.ok) {
    throw normalizeKakaoApiError(response.status, payload as KakaoErrorDto);
  }

  return payload as KakaoFriendsDto;
}

async function getKakaoUserBirthdayBatch(userIds: number[]) {
  const url = createKakaoUserBirthdayUrl(userIds);

  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${getKakaoAdminKey()}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as KakaoUserInfoDto[] | KakaoErrorDto;

  if (!response.ok) {
    throw normalizeKakaoApiError(response.status, payload as KakaoErrorDto);
  }

  return payload as KakaoUserInfoDto[];
}

/**
 * 친구 API에서 확보한 서비스 사용자 ID로 생일을 보완하는 API다.
 * 친구 탐색 기능은 없으며 Admin 키와 birthday 동의가 필요하다.
 */
export async function getKakaoUserBirthdays(userIds: number[]) {
  const users: KakaoUserInfoDto[] = [];

  // /v2/app/users는 친구를 검색할 수 없고 이미 알고 있는 사용자 ID만 최대 20개씩 조회할 수 있다.
  for (const batch of chunkKakaoUserIds(userIds)) {
    users.push(...await getKakaoUserBirthdayBatch(batch));
  }

  return users;
}

/** Admin 키로 앱에 연결된 사용자 한 명의 계정 프로필과 생일을 조회한다. */
export async function getKakaoUser(userId: number) {
  const url = createKakaoUserUrl(userId);

  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${getKakaoAdminKey()}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as KakaoUserInfoDto | KakaoErrorDto;

  if (!response.ok) {
    throw normalizeKakaoApiError(response.status, payload as KakaoErrorDto);
  }

  return payload as KakaoUserInfoDto;
}
