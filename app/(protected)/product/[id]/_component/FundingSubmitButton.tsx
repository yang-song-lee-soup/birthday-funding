"use client";

import { useState } from "react";

import { useToastMessageContext } from "@/providers/ToastMessageProvider";
import { addFundingAction } from "@/service/funding/funding.actions";
import type { ProductDto } from "@/service/product/product.interface";
import BaseButton from "@/components/ui/Button/BaseButton";

type FundingSubmitButtonProps = {
  userId?: string;
  product: ProductDto;
};

export default function FundingSubmitButton({
  userId,
  product
}: FundingSubmitButtonProps) {
  const { showToastMessage } = useToastMessageContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFunding = async () => {
    setIsLoading(true);
    try {
      const [, error] = await addFundingAction({ userId, product });

      if (error) {
        showToastMessage({ type: "error", message: error.message });
        return;
      }

      showToastMessage({
        type: "success",
        message: "펀딩 상품이 추가되었습니다."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    < BaseButton
      variant="filled"
      // color="kakao"
      className="mt-10 w-full cursor-pointer bg-kakao text-kakao-content"
      size="full"
      isLoading={isLoading}
      onClick={handleAddFunding}
    >
      상품 추가
    </BaseButton>
  );
}
