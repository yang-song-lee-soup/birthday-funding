// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  completeKakaoReconnect: vi.fn(),
  reconnectWithKakao: vi.fn(),
  showToastMessage: vi.fn(),
  signOut: vi.fn(),
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

import UserDetail from "./user-detail";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks();
  mocks.reconnectWithKakao.mockResolvedValue([undefined, null]);
  mocks.signOut.mockResolvedValue([undefined, null]);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("UserDetail", () => {
  it("서버에서 받은 친구 상세를 즉시 표시하고 재연결 표식을 완료한다", async () => {
    await act(async () => root.render(
      <UserDetail initialResult={[{
        id: "friend-uuid",
        displayName: "생일 친구",
        birthday: "1130",
        birthdayType: "SOLAR",
      }, null]} />,
    ));

    expect(host.textContent).toContain("생일 친구");
    expect(host.textContent).toContain("11월 30일");
    expect(host.querySelector('a[href="/user"]')).not.toBeNull();
    expect(host.querySelector('a[href="/product"]')).not.toBeNull();
    expect(mocks.completeKakaoReconnect).toHaveBeenCalledTimes(1);
  });

  it("직렬화된 Kakao 만료 오류로 자동 재연결을 요청한다", async () => {
    await act(async () => root.render(
      <UserDetail initialResult={[null, {
        service: "user",
        error: "KAKAO_AUTHORIZATION_EXPIRED",
        status: 401,
        message: "Kakao authorization has expired. Please sign in again.",
      }]} />,
    ));
    await vi.waitFor(() => expect(mocks.reconnectWithKakao).toHaveBeenCalledTimes(1));

    expect(host.textContent).toContain("카카오 연결을 확인하고 있습니다.");
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.showToastMessage).not.toHaveBeenCalled();
  });
});
