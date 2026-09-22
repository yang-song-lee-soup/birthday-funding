import { AuthApiError } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { AuthBrowserClient, type AuthApi } from "./auth.client";

function createAuthApi(getUser: AuthApi["getUser"]) {
  return {
    getUser,
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn()
  } as unknown as AuthApi;
}

describe("브라우저 인증 클라이언트", () => {
  it("유효하지 않은 세션의 401은 비로그인 결과로 정규화한다", async () => {
    const auth = createAuthApi(
      vi.fn().mockResolvedValue({
        data: { user: null },
        error: new AuthApiError("invalid JWT", 401, "bad_jwt")
      })
    );

    const client = new AuthBrowserClient(auth);

    await expect(client.fetchCurrentUser()).resolves.toEqual([null, null]);
  });
});
