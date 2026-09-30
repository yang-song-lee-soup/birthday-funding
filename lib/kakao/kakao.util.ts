import "server-only";

const KAKAO_FRIENDS_URL = "https://kapi.kakao.com/v1/api/talk/friends";
const KAKAO_USERS_URL = "https://kapi.kakao.com/v2/app/users";
const KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me";
const KAKAO_USER_INFO_BATCH_SIZE = 20;

export function getKakaoAdminKey() {
  const adminKey = process.env.KAKAO_ADMIN_KEY;
  if (!adminKey) throw new Error("KAKAO_ADMIN_KEY is not configured.");
  return adminKey;
}

export function createKakaoFriendsUrl(offset: number) {
  const url = new URL(KAKAO_FRIENDS_URL);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("limit", "100");
  url.searchParams.set("friend_order", "nickname");
  return url;
}

export function createKakaoUserBirthdayUrl(userIds: number[]) {
  const url = new URL(KAKAO_USERS_URL);
  url.searchParams.set("target_id_type", "user_id");
  url.searchParams.set("target_ids", JSON.stringify(userIds));
  url.searchParams.set("property_keys", JSON.stringify(["kakao_account.birthday"]));
  return url;
}

export function createKakaoUserUrl(userId: number) {
  const url = new URL(KAKAO_USER_URL);
  url.searchParams.set("target_id_type", "user_id");
  url.searchParams.set("target_id", String(userId));
  url.searchParams.set("secure_resource", "true");
  url.searchParams.set(
    "property_keys",
    JSON.stringify(["kakao_account.profile", "kakao_account.birthday"]),
  );
  return url;
}

export function chunkKakaoUserIds(userIds: number[]) {
  const batches: number[][] = [];

  for (let index = 0; index < userIds.length; index += KAKAO_USER_INFO_BATCH_SIZE) {
    batches.push(userIds.slice(index, index + KAKAO_USER_INFO_BATCH_SIZE));
  }

  return batches;
}
