// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Badge from "./Badge";

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("공용 뱃지", () => {
  it("라벨을 표시한다", async () => {
    await act(async () => root.render(<Badge>beauty</Badge>));

    expect(host.textContent).toBe("beauty");
  });

  it("색상 클래스를 적용한다", async () => {
    await act(async () => root.render(<Badge color="kakao">beauty</Badge>));

    expect(host.querySelector("span")?.className).toContain("bg-kakao");
  });
});
