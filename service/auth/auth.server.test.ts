import {
  AuthApiError,
  AuthSessionMissingError,
  type Session,
  type User
} from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn()
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: mocks.createServerClient
}));

import { getProviderToken, getRequestUser } from "./auth.server";

describe("서버 인증 DAL", () => {
  beforeEach(() => {
    mocks.createServerClient.mockReset();
  });

  it("현재 요청의 서버 클라이언트로 사용자를 검증한다", async () => {
    const user = { id: "user" } as User;
    const getUser = vi.fn().mockResolvedValue({ data: { user }, error: null });
    mocks.createServerClient.mockResolvedValue({ auth: { getUser } });

    await expect(getRequestUser()).resolves.toBe(user);
    expect(mocks.createServerClient).toHaveBeenCalledOnce();
    expect(getUser).toHaveBeenCalledOnce();
  });

  it("세션 없음은 비로그인으로 처리하고 그 밖의 오류는 전파한다", async () => {
    mocks.createServerClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new AuthSessionMissingError()
        })
      }
    });

    await expect(getRequestUser()).resolves.toBeNull();

    mocks.createServerClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new AuthApiError("invalid JWT", 401, "bad_jwt")
        })
      }
    });

    await expect(getRequestUser()).resolves.toBeNull();

    const networkError = new Error("network");
    mocks.createServerClient.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: networkError
        })
      }
    });

    await expect(getRequestUser()).rejects.toBe(networkError);
  });

  it("검증된 사용자가 있을 때만 provider token을 반환한다", async () => {
    const getSession = vi.fn().mockResolvedValue({
      data: {
        session: { provider_token: "provider-token" } as Session
      },
      error: null
    });

    mocks.createServerClient
      .mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: "user" } as User },
            error: null
          })
        }
      })
      .mockResolvedValueOnce({ auth: { getSession } });

    await expect(getProviderToken()).resolves.toBe("provider-token");
    expect(getSession).toHaveBeenCalledOnce();

    mocks.createServerClient.mockReset();
    mocks.createServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new AuthSessionMissingError()
        })
      }
    });

    await expect(getProviderToken()).resolves.toBeNull();
    expect(mocks.createServerClient).toHaveBeenCalledOnce();
  });
});
