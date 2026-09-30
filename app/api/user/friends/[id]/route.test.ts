import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUserFriend } = vi.hoisted(() => ({
  getCurrentUserFriend: vi.fn(),
}));

vi.mock("@/service/user/user.server", () => ({ getCurrentUserFriend }));

import { AppError } from "@/lib/app/app-error";
import { GET } from "./route";

function context(id: string) {
  return { params: Promise.resolve({ id }) } as RouteContext<"/api/user/friends/[id]">;
}

describe("GET /api/user/friends/[id]", () => {
  beforeEach(() => {
    getCurrentUserFriend.mockReset();
  });

  it("친구 상세 조회를 user 서버 서비스에 위임한다", async () => {
    const friend = { id: "friend-uuid", displayName: "친구" };
    getCurrentUserFriend.mockResolvedValue(friend);

    const response = await GET(
      new Request("https://app.example/api/user/friends/friend-uuid?kakaoUserId=123"),
      context("friend-uuid"),
    );

    expect(getCurrentUserFriend).toHaveBeenCalledWith("friend-uuid", 123);
    await expect(response.json()).resolves.toEqual(friend);
  });

  it("친구를 찾지 못하면 404를 반환한다", async () => {
    getCurrentUserFriend.mockResolvedValue(null);

    const response = await GET(
      new Request("https://app.example/api/user/friends/missing?kakaoUserId=123"),
      context("missing"),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ code: "USER_FRIEND_NOT_FOUND" });
  });

  it("Kakao 인증 만료 오류 코드를 보존한다", async () => {
    getCurrentUserFriend.mockRejectedValue(new AppError({
      service: "user",
      error: "KAKAO_AUTHORIZATION_EXPIRED",
      status: 401,
      message: "Kakao authorization has expired. Please sign in again.",
    }));

    const response = await GET(
      new Request("https://app.example/api/user/friends/friend-uuid?kakaoUserId=123"),
      context("friend-uuid"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "KAKAO_AUTHORIZATION_EXPIRED",
    });
  });

  it("Kakao 회원번호가 없으면 조회하지 않고 404를 반환한다", async () => {
    const response = await GET(
      new Request("https://app.example/api/user/friends/friend-uuid"),
      context("friend-uuid"),
    );

    expect(getCurrentUserFriend).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
  });
});
