import { productService } from "@/app/service/product/product.service";
import { parseProductSearchParams } from "@/app/service/product/product.util";
import { AppError } from "@/lib/error";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const params = parseProductSearchParams(request.nextUrl.searchParams);
    const data = await productService.getAll(params);

    return Response.json({ data });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return Response.json(
      { error: "상품 검색 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
