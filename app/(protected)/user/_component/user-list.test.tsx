// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { UserFriend } from "@/service/user/user.interface";
import UserList from "./user-list";

const user: UserFriend = {
  id: "friend/uuid",
  kakaoUserId: 123,
  displayName: "생일 친구",
  isFavorite: true,
  birthday: "1130",
  birthdayType: "SOLAR",
};

describe("UserList", () => {
  it("사용자 항목을 상세 페이지 링크로 표시한다", () => {
    const html = renderToStaticMarkup(
      <UserList users={[user]} totalCount={1} isLoading={false} onLoadMore={() => {}} />,
    );

    expect(html).toContain('href="/user/friend%2Fuuid?kakaoUserId=123"');
    expect(html).toContain("생일 친구");
    expect(html).toContain("11월 30일");
  });

  it("사용자가 없으면 빈 목록 안내를 표시한다", () => {
    const html = renderToStaticMarkup(
      <UserList users={[]} totalCount={0} isLoading={false} onLoadMore={() => {}} />,
    );

    expect(html).toContain("표시할 카카오톡 친구가 없습니다.");
  });

  it("남은 사용자가 있으면 더보기 버튼을 표시한다", () => {
    const html = renderToStaticMarkup(
      <UserList users={[user]} totalCount={2} isLoading={false} onLoadMore={() => {}} />,
    );

    expect(html).toContain("친구 더 보기");
  });
});
