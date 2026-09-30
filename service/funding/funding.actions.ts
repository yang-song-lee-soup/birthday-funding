"use server";

import { toResult, type ServiceResult } from "@/lib/app/app-result";
import type { AddFundingParams, FundingRow } from "./funding.interface";
import { insertFunding } from "./funding.repository";

/** 클라이언트(폼·버튼) 진입점. 이 파일은 async function만 export한다. */
export async function addFundingAction(
  params: AddFundingParams
): Promise<ServiceResult<FundingRow>> {
  if (!params.userId) {
    return [
      null,
      {
        service: "funding",
        error: "USER_NOT_FOUND",
        status: 403,
        message: "유저 정보가 없습니다."
      }
    ];
  }

  if (!params.product) {
    return [
      null,
      {
        service: "funding",
        error: "PRODUCT_NOT_FOUND",
        status: 400,
        message: "상품 정보가 없습니다."
      }
    ];
  }

  return toResult(
    insertFunding({ userId: params.userId, product: params.product })
  );
}
