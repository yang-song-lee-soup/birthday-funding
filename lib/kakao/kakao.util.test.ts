import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  chunkKakaoUserIds,
  createKakaoFriendsUrl,
  createKakaoUserBirthdayUrl,
  createKakaoUserUrl,
  getKakaoAdminKey,
} from "./kakao.util";

describe("Kakao utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the server-only Admin key", () => {
    vi.stubEnv("KAKAO_ADMIN_KEY", "admin-key");
    expect(getKakaoAdminKey()).toBe("admin-key");
  });

  it("rejects a missing Admin key", () => {
    vi.stubEnv("KAKAO_ADMIN_KEY", "");
    expect(() => getKakaoAdminKey()).toThrow("KAKAO_ADMIN_KEY is not configured.");
  });

  it("builds Kakao request URLs", () => {
    const friendsUrl = createKakaoFriendsUrl(10);
    const birthdayUrl = createKakaoUserBirthdayUrl([1, 2]);
    const userUrl = createKakaoUserUrl(123);

    expect(friendsUrl.searchParams.get("offset")).toBe("10");
    expect(friendsUrl.searchParams.get("limit")).toBe("100");
    expect(JSON.parse(birthdayUrl.searchParams.get("target_ids")!)).toEqual([1, 2]);
    expect(userUrl.pathname).toBe("/v2/user/me");
    expect(userUrl.searchParams.get("target_id")).toBe("123");
    expect(JSON.parse(userUrl.searchParams.get("property_keys")!)).toEqual([
      "kakao_account.profile",
      "kakao_account.birthday",
    ]);
  });

  it("chunks user IDs by the Kakao limit", () => {
    const userIds = Array.from({ length: 21 }, (_, index) => index + 1);
    expect(chunkKakaoUserIds(userIds)).toEqual([userIds.slice(0, 20), [21]]);
  });
});
