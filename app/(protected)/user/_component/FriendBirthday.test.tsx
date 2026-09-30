// @vitest-environment jsdom
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import FriendBirthday from "./FriendBirthday";

describe("FriendBirthday", () => {
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

  it("formats a solar birthday", async () => {
    await act(async () => root.render(
      <FriendBirthday birthday="1130" birthdayType="SOLAR" isLeapMonth={false} />,
    ));

    expect(host.textContent).toBe("생일 11월 30일 · 양력");
  });

  it("shows the missing state when birthday consent or data is absent", async () => {
    await act(async () => root.render(<FriendBirthday />));

    expect(host.textContent).toBe("생일 정보 없음");
  });
});
