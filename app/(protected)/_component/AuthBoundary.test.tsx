// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn(), toast: vi.fn(), handleUnauthenticated: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => mocks }));
vi.mock("@/providers/ToastMessageProvider", () => ({
  useToastMessageContext: () => ({ showToastMessage: mocks.toast }),
}));
import { AuthContext } from "@/providers/AuthProvider";
import type { AuthContextValue } from "@/service/auth/auth.interface";
import AuthBoundary from "./AuthBoundary";

let host: HTMLDivElement;
let root: Root;
let value: AuthContextValue;
async function render() {
  await act(async () => root.render(
    <StrictMode><AuthContext.Provider value={value}>
      <AuthBoundary>private content</AuthBoundary>
    </AuthContext.Provider></StrictMode>,
  ));
}
beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  value = {
    user: null, userInfo: { displayName: "unknown" }, isLogin: false, isLoading: false,
    authError: null, refetchUser: vi.fn().mockResolvedValue([null, null]),
    signInWithKakao: vi.fn(), signOut: vi.fn(),
    handleUnauthenticated: mocks.handleUnauthenticated,
  };
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
describe("AuthBoundary", () => {
  it("waits for initialization", async () => {
    value.isLoading = true;
    await render();
    const spinner = host.querySelector('[role="status"]');
    expect(spinner?.getAttribute('aria-label')).toBe('로그인 상태를 확인하고 있습니다.');
    expect(spinner?.getAttribute('class')).toContain('motion-safe:animate-spin');
    expect(spinner?.getAttribute('class')).toContain('size-[32px]');
    expect(spinner?.querySelector('circle')).not.toBeNull();
    expect(spinner?.querySelector('path')).not.toBeNull();
    expect(spinner?.parentElement?.className).toContain('place-items-center');
    expect(host.textContent).not.toContain('로그인 상태를 확인하고 있습니다.');
    expect(host.textContent).not.toContain("private content");
    expect(mocks.handleUnauthenticated).not.toHaveBeenCalled();
  });
  it("delegates confirmed unauthenticated state to the Provider", async () => {
    await render();
    await render();
    expect(mocks.handleUnauthenticated).toHaveBeenCalled();
  });
  it("retries lookup errors without redirecting", async () => {
    value.authError = { service: "unknown", error: "INTERNAL_ERROR", status: 500, message: "network" };
    await render();
    await act(async () => host.querySelector("button")!.click());
    expect(value.refetchUser).toHaveBeenCalledTimes(1);
    expect(mocks.handleUnauthenticated).not.toHaveBeenCalled();
  });
  it("renders protected children only when logged in", async () => {
    value.isLogin = true;
    await render();
    expect(host.textContent).toContain("private content");
    expect(mocks.handleUnauthenticated).not.toHaveBeenCalled();
  });
  it("preserves the page and input through refetch loading, failure and retry", async () => {
    value.isLogin = true;
    async function renderInput() {
      await act(async () => root.render(
        <StrictMode><AuthContext.Provider value={{ ...value }}>
          <AuthBoundary><input defaultValue="initial" /></AuthBoundary>
        </AuthContext.Provider></StrictMode>,
      ));
    }
    await renderInput();
    const input = host.querySelector('input')!;
    input.value = 'edited';
    value.isLoading = true;
    await renderInput();
    expect(host.querySelector('input')).toBe(input);
    expect(host.querySelector('svg[role="status"]')).toBeNull();
    value.isLoading = false;
    value.authError = { service: 'unknown', error: 'INTERNAL_ERROR', status: 500, message: 'network' };
    await renderInput();
    expect(host.querySelector('input')).toBe(input);
    expect(input.value).toBe('edited');
    expect(host.querySelector('[role="alert"]')).not.toBeNull();
    await act(async () => host.querySelector('button')!.click());
    expect(value.refetchUser).toHaveBeenCalledTimes(1);
    value.isLoading = true;
    await renderInput();
    expect(host.querySelector('button')!.disabled).toBe(true);
    value.isLoading = false;
    value.authError = null;
    await renderInput();
    expect(host.querySelector('input')).toBe(input);
    expect(input.value).toBe('edited');
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });
});
