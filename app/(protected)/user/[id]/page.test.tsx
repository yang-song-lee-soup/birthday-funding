import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUserFriend: vi.fn(),
}));

vi.mock("@/service/user/user.server", () => ({
  getCurrentUserFriend: mocks.getCurrentUserFriend,
}));

vi.mock("../_component/user-detail", () => ({
  default: ({ initialResult }: { initialResult: readonly [unknown, unknown] }) => (
    <div
      data-has-friend={String(initialResult[0] !== null)}
      data-error={(initialResult[1] as { error?: string } | null)?.error}
    />
  ),
}));

import UserDetailPage from "./page";

describe("UserDetailPage", () => {
  beforeEach(() => {
    mocks.getCurrentUserFriend.mockReset();
  });

  it("동적 경로의 친구를 서버에서 조회해 상세 컴포넌트에 전달한다", async () => {
    mocks.getCurrentUserFriend.mockResolvedValue({
      id: "friend-uuid",
      displayName: "생일 친구",
    });

    const ui = await UserDetailPage({
      params: Promise.resolve({ id: "friend-uuid" }),
      searchParams: Promise.resolve({ kakaoUserId: "123" }),
    } as Parameters<typeof UserDetailPage>[0]);
    const html = renderToStaticMarkup(ui);

    expect(mocks.getCurrentUserFriend).toHaveBeenCalledWith("friend-uuid", 123);
    expect(html).toContain('data-has-friend="true"');
  });

  it("상세 조회 오류를 직렬화 가능한 결과로 전달한다", async () => {
    mocks.getCurrentUserFriend.mockRejectedValue(new Error("failed"));

    const ui = await UserDetailPage({
      params: Promise.resolve({ id: "friend-uuid" }),
      searchParams: Promise.resolve({ kakaoUserId: "123" }),
    } as Parameters<typeof UserDetailPage>[0]);
    const html = renderToStaticMarkup(ui);

    expect(html).toContain('data-has-friend="false"');
    expect(html).toContain('data-error="INTERNAL_ERROR"');
  });

  it("유효하지 않은 Kakao 회원번호는 조회하지 않는다", async () => {
    const ui = await UserDetailPage({
      params: Promise.resolve({ id: "friend-uuid" }),
      searchParams: Promise.resolve({ kakaoUserId: "invalid" }),
    } as Parameters<typeof UserDetailPage>[0]);
    const html = renderToStaticMarkup(ui);

    expect(mocks.getCurrentUserFriend).not.toHaveBeenCalled();
    expect(html).toContain('data-error="USER_FRIEND_NOT_FOUND"');
  });
});
