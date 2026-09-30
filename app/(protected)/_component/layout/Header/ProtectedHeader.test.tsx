// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }));

vi.mock("@/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    userInfo: { displayName: "테스터", avatarUrl: null },
    isLoading: false,
    signOut,
  }),
}));

vi.mock("@/components/ui/DropdownMenu/DropdownMenu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, render }: { children: ReactNode; render: ReactNode }) => (
    <>{render}{children}</>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div role="menu">{children}</div>,
  DropdownMenuItem: ({
    children,
    disabled,
    onClick,
    render,
  }: {
    children: ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    render?: { props: { href: string } };
  }) => render ? (
    <a href={render.props.href} role="menuitem">{children}</a>
  ) : (
    <button type="button" role="menuitem" disabled={disabled} onClick={onClick}>{children}</button>
  ),
}));

import ProtectedHeader from "./ProtectedHeader";

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  signOut.mockReset().mockResolvedValue(undefined);
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("ProtectedHeader", () => {
  it("사용자 메뉴에서 마이페이지로 이동하고 로그아웃할 수 있다", async () => {
    await act(async () => root.render(<ProtectedHeader />));

    expect(host.querySelector('a[role="menuitem"]')?.getAttribute("href")).toBe("/mypage");

    const logoutItem = Array.from(host.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent === "로그아웃") as HTMLButtonElement;
    await act(async () => logoutItem.click());

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
