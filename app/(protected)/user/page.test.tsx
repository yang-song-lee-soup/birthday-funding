import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUserFriends: vi.fn(),
}));

vi.mock("@/service/user/user.server", () => ({
  getCurrentUserFriends: mocks.getCurrentUserFriends,
}));

vi.mock("./_component/user-page-client", () => ({
  default: ({ initialResult }: { initialResult: readonly [unknown, unknown] }) => (
    <div
      data-has-data={String(initialResult[0] !== null)}
      data-error={(initialResult[1] as { error?: string } | null)?.error}
    />
  ),
}));

import UserPage from "./page";

describe("UserPage", () => {
  it("서버에서 첫 친구 페이지를 조회해 클라이언트 컴포넌트에 전달한다", async () => {
    mocks.getCurrentUserFriends.mockResolvedValue({
      friends: [],
      totalCount: 0,
      nextOffset: 0,
    });

    const html = renderToStaticMarkup(await UserPage());

    expect(mocks.getCurrentUserFriends).toHaveBeenCalledWith(0);
    expect(html).toContain('data-has-data="true"');
  });

  it("서버 조회 오류를 직렬화 가능한 결과로 전달한다", async () => {
    mocks.getCurrentUserFriends.mockRejectedValue(new Error("failed"));

    const html = renderToStaticMarkup(await UserPage());

    expect(html).toContain('data-has-data="false"');
    expect(html).toContain('data-error="INTERNAL_ERROR"');
  });
});
