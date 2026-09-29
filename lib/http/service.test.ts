import { describe, expect, it } from "vitest";
import { HttpService, getServiceOrigin } from "./service";

describe("HTTP 서비스 origin", () => {
  it("APP은 앱 origin을 반환한다", () => {
    expect(getServiceOrigin(HttpService.APP)).toBe("http://localhost:3000");
  });

  it("PRODUCT는 DummyJSON origin을 반환한다", () => {
    expect(getServiceOrigin(HttpService.PRODUCT)).toBe("https://dummyjson.com");
  });

  it("KAKAO origin이 없으면 예외를 던진다", () => {
    expect(() => getServiceOrigin(HttpService.KAKAO)).toThrow(
      "HttpService.KAKAO origin is not configured"
    );
  });
});
