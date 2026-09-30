import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getKakaoFriends, getKakaoUser, getKakaoUserBirthdays } from "./kakao.server";

describe("Kakao server API", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("requests Kakao friends with the provider access token", async () => {
    const payload = { elements: [], total_count: 0 };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    await expect(getKakaoFriends("provider-token", 20)).resolves.toEqual(payload);

    const [url, options] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe("https://kapi.kakao.com/v1/api/talk/friends?offset=20&limit=100&friend_order=nickname");
    expect(new Headers(options.headers).get("Authorization")).toBe("Bearer provider-token");
    expect(options.cache).toBe("no-store");
  });

  it("throws a normalized error without exposing the provider message", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      code: -401,
      msg: "internal provider detail",
    }), { status: 401 }));

    await expect(getKakaoFriends("expired", 0)).rejects.toMatchObject({
      name: "KakaoApiError",
      kind: "INVALID_TOKEN",
      providerCode: -401,
      status: 401,
    });
  });

  it("loads birthdays with the Admin key in batches of 20", async () => {
    vi.stubEnv("KAKAO_ADMIN_KEY", "admin-key");
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 21 }]), { status: 200 }));
    const userIds = Array.from({ length: 21 }, (_, index) => index + 1);

    await expect(getKakaoUserBirthdays(userIds)).resolves.toEqual([{ id: 1 }, { id: 21 }]);

    expect(fetch).toHaveBeenCalledTimes(2);
    const [firstUrl, firstOptions] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
    const [secondUrl] = vi.mocked(fetch).mock.calls[1] as [URL, RequestInit];
    expect(firstUrl.origin + firstUrl.pathname).toBe("https://kapi.kakao.com/v2/app/users");
    expect(JSON.parse(firstUrl.searchParams.get("target_ids")!)).toEqual(userIds.slice(0, 20));
    expect(JSON.parse(secondUrl.searchParams.get("target_ids")!)).toEqual([21]);
    expect(JSON.parse(firstUrl.searchParams.get("property_keys")!)).toEqual(["kakao_account.birthday"]);
    expect(new Headers(firstOptions.headers).get("Authorization")).toBe("KakaoAK admin-key");
  });

  it("loads one user's profile and birthday with the Admin key", async () => {
    vi.stubEnv("KAKAO_ADMIN_KEY", "admin-key");
    const payload = {
      id: 123,
      kakao_account: {
        profile: { nickname: "친구" },
        birthday: "1130",
      },
      for_partner: { uuid: "friend-uuid" },
    };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    await expect(getKakaoUser(123)).resolves.toEqual(payload);

    const [url, options] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/v2/user/me");
    expect(url.searchParams.get("target_id_type")).toBe("user_id");
    expect(url.searchParams.get("target_id")).toBe("123");
    expect(url.searchParams.get("secure_resource")).toBe("true");
    expect(new Headers(options.headers).get("Authorization")).toBe("KakaoAK admin-key");
  });
});
