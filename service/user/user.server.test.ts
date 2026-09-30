import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getRequestUser: vi.fn(),
  getProviderToken: vi.fn(),
  getKakaoFriends: vi.fn(),
  getKakaoUser: vi.fn(),
  getKakaoUserBirthdays: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/service/auth/auth.server", () => ({
  getRequestUser: mocks.getRequestUser,
  getProviderToken: mocks.getProviderToken,
}));

vi.mock("@/lib/kakao/kakao.server", () => ({
  getKakaoFriends: mocks.getKakaoFriends,
  getKakaoUser: mocks.getKakaoUser,
  getKakaoUserBirthdays: mocks.getKakaoUserBirthdays,
}));

import { KakaoApiError } from "@/lib/kakao/kakao.error";
import { getCurrentUserFriend, getCurrentUserFriends } from "./user.server";

describe("user server service", () => {
  beforeEach(() => {
    mocks.getRequestUser.mockReset().mockResolvedValue({ id: "user-id" });
    mocks.getProviderToken.mockReset().mockResolvedValue("provider-token");
    mocks.getKakaoFriends.mockReset();
    mocks.getKakaoUser.mockReset();
    mocks.getKakaoUserBirthdays.mockReset().mockResolvedValue([]);
  });

  it("maps Kakao friends to the app user contract", async () => {
    mocks.getKakaoFriends.mockResolvedValue({
      elements: [{
        id: 123,
        uuid: "friend-uuid",
        profile_nickname: "친구",
        profile_thumbnail_image: "https://example.com/avatar.png",
        favorite: true,
      }],
      total_count: 3,
    });
    mocks.getKakaoUserBirthdays.mockResolvedValue([{
      id: 123,
      kakao_account: {
        birthday: "1130",
        birthday_type: "SOLAR",
        is_leap_month: false,
      },
    }]);

    await expect(getCurrentUserFriends(2)).resolves.toEqual({
      friends: [{
        id: "friend-uuid",
        kakaoUserId: 123,
        displayName: "친구",
        avatarUrl: "https://example.com/avatar.png",
        isFavorite: true,
        birthday: "1130",
        birthdayType: "SOLAR",
        isLeapMonth: false,
      }],
      totalCount: 3,
      nextOffset: 3,
    });
    expect(mocks.getKakaoFriends).toHaveBeenCalledWith("provider-token", 2);
    expect(mocks.getKakaoUserBirthdays).toHaveBeenCalledWith([123]);
  });

  it("rejects unauthenticated requests before accessing Kakao", async () => {
    mocks.getRequestUser.mockResolvedValue(null);

    await expect(getCurrentUserFriends(0)).rejects.toMatchObject({
      error: "UNAUTHORIZED",
      status: 401,
    });
    expect(mocks.getProviderToken).not.toHaveBeenCalled();
    expect(mocks.getKakaoFriends).not.toHaveBeenCalled();
    expect(mocks.getKakaoUserBirthdays).not.toHaveBeenCalled();
  });

  it("maps a missing provider token to Kakao reauthorization", async () => {
    mocks.getProviderToken.mockResolvedValue(null);

    await expect(getCurrentUserFriends(0)).rejects.toMatchObject({
      error: "KAKAO_AUTHORIZATION_EXPIRED",
      status: 401,
    });
    expect(mocks.getKakaoFriends).not.toHaveBeenCalled();
    expect(mocks.getKakaoUserBirthdays).not.toHaveBeenCalled();
  });

  it.each([
    ["INVALID_TOKEN", "KAKAO_AUTHORIZATION_EXPIRED", 401],
    ["ADDITIONAL_CONSENT_REQUIRED", "KAKAO_ADDITIONAL_CONSENT_REQUIRED", 403],
    ["PERMISSION_REQUIRED", "KAKAO_TESTER_REQUIRED", 403],
    ["RATE_LIMITED", "KAKAO_RATE_LIMITED", 429],
  ] as const)("maps Kakao %s to %s", async (kind, code, status) => {
    mocks.getKakaoFriends.mockRejectedValue(new KakaoApiError(kind, status));

    await expect(getCurrentUserFriends(0)).rejects.toMatchObject({
      error: code,
      status,
    });
  });

  it("does not treat an Admin API failure as an expired user token", async () => {
    mocks.getKakaoFriends.mockResolvedValue({
      elements: [{ id: 123, uuid: "friend-uuid" }],
      total_count: 1,
    });
    mocks.getKakaoUserBirthdays.mockRejectedValue(
      new KakaoApiError("INVALID_TOKEN", 401, -401),
    );

    await expect(getCurrentUserFriends(0)).rejects.toMatchObject({
      error: "KAKAO_FRIENDS_REQUEST_FAILED",
      status: 502,
    });
  });

  it("loads one friend detail directly by Kakao user ID", async () => {
    mocks.getKakaoUser.mockResolvedValue({
      id: 2,
      kakao_account: {
        profile: { nickname: "선택한 친구" },
        birthday: "1130",
        birthday_type: "SOLAR",
      },
      for_partner: { uuid: "selected-friend" },
    });

    await expect(getCurrentUserFriend("selected-friend", 2)).resolves.toMatchObject({
      id: "selected-friend",
      displayName: "선택한 친구",
      birthday: "1130",
    });
    expect(mocks.getKakaoUser).toHaveBeenCalledWith(2);
    expect(mocks.getKakaoFriends).not.toHaveBeenCalled();
    expect(mocks.getKakaoUserBirthdays).not.toHaveBeenCalled();
  });

  it("does not require the optional for_partner UUID in a detail response", async () => {
    mocks.getKakaoUser.mockResolvedValue({
      id: 2,
      kakao_account: { profile: { nickname: "선택한 친구" } },
    });

    await expect(getCurrentUserFriend("selected-friend", 2)).resolves.toMatchObject({
      id: "selected-friend",
      displayName: "선택한 친구",
    });
  });
});
