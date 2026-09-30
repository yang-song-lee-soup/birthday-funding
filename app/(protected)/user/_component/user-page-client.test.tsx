// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getFriends: vi.fn(),
  completeKakaoReconnect: vi.fn(),
  reconnectWithKakao: vi.fn(),
  signOut: vi.fn(),
  showToastMessage: vi.fn(),
}));

vi.mock("@/service/user/user.client", () => ({
  UserBrowserClient: class {
    fetchFriends = mocks.getFriends;
  },
}));

vi.mock("@/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    completeKakaoReconnect: mocks.completeKakaoReconnect,
    reconnectWithKakao: mocks.reconnectWithKakao,
    signOut: mocks.signOut,
  }),
}));

vi.mock("@/providers/ToastMessageProvider", () => ({
  useToastMessageContext: () => ({ showToastMessage: mocks.showToastMessage }),
}));

import UserPageClient from "./user-page-client";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mocks.reconnectWithKakao.mockReset().mockResolvedValue([undefined, null]);
  mocks.completeKakaoReconnect.mockReset();
  mocks.signOut.mockReset().mockResolvedValue([undefined, null]);
  mocks.showToastMessage.mockReset();
  mocks.getFriends.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("UserPageClient", () => {
  it("서버에서 받은 친구를 즉시 표시하고 최초 API 요청을 하지 않는다", async () => {
    await act(async () => root.render(
      <UserPageClient initialResult={[{
        friends: [{
          id: "friend-uuid",
          kakaoUserId: 123,
          displayName: "생일 친구",
          isFavorite: false,
          birthday: "1130",
          birthdayType: "SOLAR",
        }],
        totalCount: 1,
        nextOffset: 1,
      }, null]} />,
    ));

    expect(host.textContent).toContain("생일 친구");
    expect(host.querySelector('a[href="/user/friend-uuid?kakaoUserId=123"]')).not.toBeNull();
    expect(mocks.getFriends).not.toHaveBeenCalled();
    expect(mocks.completeKakaoReconnect).toHaveBeenCalledTimes(1);
  });

  it("직렬화된 Kakao 만료 오류로 재연결을 한 번 요청한다", async () => {
    window.history.replaceState(null, "", "/user?tab=friends");

    await act(async () => root.render(
      <UserPageClient initialResult={[null, {
        service: "user",
        error: "KAKAO_AUTHORIZATION_EXPIRED",
        status: 401,
        message: "Kakao authorization has expired. Please sign in again.",
      }]} />,
    ));
    await vi.waitFor(() => expect(mocks.reconnectWithKakao).toHaveBeenCalledTimes(1));

    expect(mocks.getFriends).not.toHaveBeenCalled();
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.showToastMessage).not.toHaveBeenCalled();
  });
});
