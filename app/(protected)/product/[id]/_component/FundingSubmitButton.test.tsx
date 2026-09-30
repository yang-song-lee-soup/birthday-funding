// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductDto } from "@/service/product/product.interface";

const { addFundingAction, showToastMessage } = vi.hoisted(() => ({
  addFundingAction: vi.fn(),
  showToastMessage: vi.fn()
}));

vi.mock("@/service/funding/funding.actions", () => ({
  addFundingAction
}));
vi.mock("@/providers/ToastMessageProvider", () => ({
  useToastMessageContext: () => ({ showToastMessage })
}));

import FundingSubmitButton from "./FundingSubmitButton";

const product = {
  id: 1,
  title: "마스카라",
  description: "설명",
  category: "beauty",
  price: 9.99,
  discountPercentage: 10,
  rating: 4.5,
  stock: 5,
  tags: [],
  sku: "sku",
  weight: 1,
  dimensions: { width: 1, height: 1, depth: 1 },
  warrantyInformation: "w",
  shippingInformation: "s",
  availabilityStatus: "ok",
  reviews: [],
  returnPolicy: "r",
  minimumOrderQuantity: 1,
  meta: {
    createdAt: "a",
    updatedAt: "b",
    barcode: "c",
    qrCode: "d"
  },
  thumbnail: "https://example.com/t.png",
  images: []
} satisfies ProductDto;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  addFundingAction.mockReset();
  showToastMessage.mockReset();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("FundingSubmitButton", () => {
  it("클릭 시 addFundingAction을 호출하고 성공 토스트를 띄운다", async () => {
    addFundingAction.mockResolvedValue([
      { id: 1, product_id: 1, user_id: "user-1", created_at: "" },
      null
    ]);

    await act(async () => {
      root.render(
        <FundingSubmitButton userId="user-1" product={product} />
      );
    });

    const button = host.querySelector("button")!;
    await act(async () => {
      button.click();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(addFundingAction).toHaveBeenCalledWith({
      userId: "user-1",
      product
    });
    expect(showToastMessage).toHaveBeenCalledWith({
      type: "success",
      message: "펀딩 상품이 추가되었습니다."
    });
  });

  it("action 실패 시 에러 토스트를 띄운다", async () => {
    addFundingAction.mockResolvedValue([
      null,
      {
        service: "funding",
        error: "ADD_FUNDING_FAILED",
        status: 500,
        message: "펀딩 추가에 실패했습니다."
      }
    ]);

    await act(async () => {
      root.render(
        <FundingSubmitButton userId="user-1" product={product} />
      );
    });

    await act(async () => {
      host.querySelector("button")!.click();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(showToastMessage).toHaveBeenCalledWith({
      type: "error",
      message: "펀딩 추가에 실패했습니다."
    });
  });
});
