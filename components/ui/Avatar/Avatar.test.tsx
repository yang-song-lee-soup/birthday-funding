// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import Avatar from "./Avatar";

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

describe("공용 아바타", () => {
  it("이미지가 없으면 이름의 첫 글자를 표시한다", async () => {
    await act(async () => root.render(
      <Avatar src={null} alt="홍길동 프로필" fallback="홍길동" size="sm" />
    ));

    expect(host.textContent).toBe("홍");
    expect(host.querySelector("span")?.className).toContain("h-10");
  });

  it("이미지 로드에 실패하면 fallback을 표시한다", async () => {
    await act(async () => root.render(
      <Avatar
        src="https://p.kakaocdn.net/profile.jpg"
        alt="홍길동 프로필"
        fallback="홍길동"
      />
    ));

    const image = host.querySelector("img")!;
    expect(image.getAttribute("alt")).toBe("홍길동 프로필");
    await act(async () => image.dispatchEvent(new Event("error")));
    expect(host.textContent).toBe("홍");
  });

  it("Kakao CDN의 HTTP 주소를 HTTPS로 정규화한다", async () => {
    await act(async () => root.render(
      <Avatar
        src="http://k.kakaocdn.net/profile.jpg"
        alt="홍길동 프로필"
        fallback="홍길동"
      />
    ));

    expect(host.querySelector("img")?.getAttribute("src")).toContain(
      encodeURIComponent("https://k.kakaocdn.net/profile.jpg")
    );
  });
});
