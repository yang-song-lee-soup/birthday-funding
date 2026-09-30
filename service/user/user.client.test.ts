// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UserBrowserClient } from "./user.client";

describe("UserBrowserClient", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/user");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests the current user's friends endpoint", async () => {
    const list = { friends: [], totalCount: 0, nextOffset: 0 };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(list), { status: 200 }));

    await expect(new UserBrowserClient().fetchFriends(10)).resolves.toEqual([list, null]);

    const [url, options] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe(`${window.location.origin}/api/user/friends?offset=10`);
    expect(options).toEqual({ cache: "no-store" });
  });

  it("preserves application error codes", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      code: "KAKAO_AUTHORIZATION_EXPIRED",
      message: "Kakao authorization has expired. Please sign in again.",
    }), { status: 401 }));

    const [data, error] = await new UserBrowserClient().fetchFriends(0);

    expect(data).toBeNull();
    expect(error).toMatchObject({
      service: "user",
      error: "KAKAO_AUTHORIZATION_EXPIRED",
      status: 401,
    });
  });

  it("requests an encoded friend detail endpoint", async () => {
    const friend = { id: "friend/uuid", displayName: "친구" };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(friend), { status: 200 }));

    await expect(new UserBrowserClient().fetchFriend("friend/uuid", 123)).resolves.toEqual([
      friend,
      null,
    ]);

    const [url, options] = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe(`${window.location.origin}/api/user/friends/friend%2Fuuid?kakaoUserId=123`);
    expect(options).toEqual({ cache: "no-store" });
  });
});
