import { describe, expect, it } from "vitest";

import { normalizeKakaoApiError } from "./kakao.error";

describe("normalizeKakaoApiError", () => {
  it.each([
    [-401, "INVALID_TOKEN"],
    [-402, "ADDITIONAL_CONSENT_REQUIRED"],
    [-5, "PERMISSION_REQUIRED"],
    [-10, "RATE_LIMITED"],
    [-406, "UNDERAGE_NOT_ALLOWED"],
    [-101, "NOT_REGISTERED_USER"],
    [-999, "UNKNOWN"],
  ] as const)("normalizes Kakao code %i to %s", (code, kind) => {
    expect(normalizeKakaoApiError(401, { code })).toMatchObject({
      kind,
      status: 401,
      providerCode: code,
    });
  });

  it("preserves scopes required for additional consent", () => {
    expect(normalizeKakaoApiError(403, {
      code: -402,
      required_scopes: ["friends"],
    })).toMatchObject({
      kind: "ADDITIONAL_CONSENT_REQUIRED",
      requiredScopes: ["friends"],
    });
  });
});
