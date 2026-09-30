import { describe, expect, it } from "vitest";

import { parseUserFriendsOffset, toUserFriend, toUserFriendDetail } from "./user.util";

describe("user utilities", () => {
  it("parses a non-negative integer offset", () => {
    expect(parseUserFriendsOffset("https://app.example/api/user/friends?offset=10")).toBe(10);
    expect(parseUserFriendsOffset("https://app.example/api/user/friends?offset=-1")).toBeNull();
  });

  it("maps a Kakao friend and birthday to the user contract", () => {
    expect(toUserFriend(
      { id: 1, uuid: "friend-uuid", profile_nickname: "친구", favorite: true },
      { birthday: "1130", birthday_type: "SOLAR" },
    )).toEqual({
      id: "friend-uuid",
      kakaoUserId: 1,
      displayName: "친구",
      avatarUrl: undefined,
      isFavorite: true,
      birthday: "1130",
      birthdayType: "SOLAR",
      isLeapMonth: undefined,
    });
  });

  it("maps a Kakao user response to the friend detail contract", () => {
    expect(toUserFriendDetail({
      id: 1,
      kakao_account: {
        profile: {
          nickname: "친구",
          thumbnail_image_url: "https://example.com/avatar.png",
        },
        birthday: "1130",
        birthday_type: "SOLAR",
      },
      for_partner: { uuid: "friend-uuid" },
    }, "friend-uuid")).toEqual({
      id: "friend-uuid",
      displayName: "친구",
      avatarUrl: "https://example.com/avatar.png",
      birthday: "1130",
      birthdayType: "SOLAR",
      isLeapMonth: undefined,
    });
  });
});
