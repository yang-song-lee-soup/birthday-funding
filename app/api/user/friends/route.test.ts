import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUserFriends } = vi.hoisted(() => ({
  getCurrentUserFriends: vi.fn(),
}));

vi.mock("@/service/user/user.server", () => ({ getCurrentUserFriends }));

import { AppError } from "@/lib/app/app-error";
import { GET } from "./route";

describe("GET /api/user/friends", () => {
  beforeEach(() => {
    getCurrentUserFriends.mockReset();
  });

  it("delegates friend loading to the user server service", async () => {
    const list = { friends: [], totalCount: 0, nextOffset: 10 };
    getCurrentUserFriends.mockResolvedValue(list);

    const response = await GET(new Request("https://app.example/api/user/friends?offset=10"));

    expect(getCurrentUserFriends).toHaveBeenCalledWith(10);
    await expect(response.json()).resolves.toEqual(list);
  });

  it("rejects an invalid offset without calling the service", async () => {
    const response = await GET(new Request("https://app.example/api/user/friends?offset=-1"));

    expect(response.status).toBe(400);
    expect(getCurrentUserFriends).not.toHaveBeenCalled();
  });

  it("converts application errors to HTTP responses", async () => {
    getCurrentUserFriends.mockRejectedValue(new AppError({
      service: "user",
      error: "KAKAO_AUTHORIZATION_EXPIRED",
      status: 401,
      message: "Kakao authorization has expired. Please sign in again.",
    }));

    const response = await GET(new Request("https://app.example/api/user/friends?offset=0"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "KAKAO_AUTHORIZATION_EXPIRED",
      message: "Kakao authorization has expired. Please sign in again.",
    });
  });
});
