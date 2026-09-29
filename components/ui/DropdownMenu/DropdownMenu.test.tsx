// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./DropdownMenu";

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

describe("공용 드롭다운 메뉴", () => {
  it("트리거로 메뉴를 열고 활성화된 항목을 선택한다", async () => {
    const onSelect = vi.fn();
    await act(async () => root.render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" />}>사용자 메뉴</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onSelect}>마이페이지</DropdownMenuItem>
          <DropdownMenuItem disabled>로그아웃</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ));

    await act(async () => host.querySelector("button")!.click());

    const items = document.body.querySelectorAll<HTMLElement>('[role="menuitem"]');
    expect(items).toHaveLength(2);
    expect(items[0].className).toContain("text-body-small");
    expect(items[1].hasAttribute("data-disabled")).toBe(true);

    await act(async () => items[0].click());
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
