import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRequestUser, getProviderToken } = vi.hoisted(() => ({
  getRequestUser: vi.fn(),
  getProviderToken: vi.fn(),
}));

vi.mock("@/app/service/auth/server/auth.service", () => ({
  getRequestUser,
  getProviderToken,
}));

import { GET } from "./route";

describe("GET /api/kakao/friends", () => {
  beforeEach(() => {
    getRequestUser.mockReset().mockResolvedValue({ id: "user-id" });
    getProviderToken.mockReset().mockResolvedValue("kakao-token");
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns a friendly message when Kakao requires a test team member", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      msg: "There are no team members except the caller for App(id=1574521). In order to call unreviewed api, invite testers as a team member, first.",
    }), { status: 403 }));

    const response = await GET(new Request("https://app.example/api/kakao/friends?offset=0"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "KAKAO_TESTER_REQUIRED",
      message: "현재 앱 개발/테스트 단계 앱으로 카카오톡 친구 목록은 테스트 멤버끼리만 확인할 수 있습니다. 앱 관리자에게 테스트 멤버 추가를 요청한 뒤 다시 시도해 주세요.",
    });
  });

  it("does not expose other Kakao error messages", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ msg: "internal provider detail" }), { status: 400 }));

    const response = await GET(new Request("https://app.example/api/kakao/friends?offset=0"));

    await expect(response.json()).resolves.toEqual({ message: "Failed to load Kakao friends." });
  });
});
