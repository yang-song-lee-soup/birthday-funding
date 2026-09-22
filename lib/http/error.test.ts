import { describe, expect, it } from "vitest";
import { AppError } from "@/lib/app/app-error";
import { catchError } from "./error";

describe("HTTP catchError", () => {
  it("성공 응답은 통과시킨다", () => {
    expect(catchError(new Response(null, { status: 200 }))).toBeUndefined();
  });

  it("401은 UNAUTHORIZED로 던진다", () => {
    expect(() =>
      catchError(new Response(null, { status: 401, statusText: "Unauthorized" }))
    ).toThrow(AppError);
    expect(() =>
      catchError(new Response(null, { status: 401, statusText: "Unauthorized" }))
    ).toThrow(
      expect.objectContaining({
        service: "http",
        error: "UNAUTHORIZED",
        status: 401,
        message: "Authentication required"
      })
    );
  });

  it("403은 FORBIDDEN으로 던진다", () => {
    expect(() =>
      catchError(new Response(null, { status: 403, statusText: "Forbidden" }))
    ).toThrow(
      expect.objectContaining({
        service: "http",
        error: "FORBIDDEN",
        status: 403,
        message: "Access denied"
      })
    );
  });

  it("그 외 실패는 statusText를 메시지로 던진다", () => {
    expect(() =>
      catchError(new Response(null, { status: 404, statusText: "Not Found" }))
    ).toThrow(
      expect.objectContaining({
        service: "http",
        error: "HTTP_ERROR",
        status: 404,
        message: "Not Found"
      })
    );
  });
});
