import { ProductErrorCode, ProductServiceError } from "./product.error";
import type {
  NaverErrorResponse,
  NaverShopSearchResponse,
  ProductSearchParams,
} from "./product.interface";

export class NaverShopClient {
  private readonly shopSearchUrl =
    "https://openapi.naver.com/v1/search/shop.json";

  async getAll(params: ProductSearchParams): Promise<NaverShopSearchResponse> {
    const { clientId, clientSecret } = this.getCredentials();
    const url = this.buildSearchUrl(params);
    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw await this.toError(response);
    }

    return (await response.json()) as NaverShopSearchResponse;
  }

  private getCredentials() {
    const clientId = process.env.NAVER_API_CLIENT_ID;
    const clientSecret = process.env.NAVER_API_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new ProductServiceError(
        ProductErrorCode.NAVER_CREDENTIALS_MISSING,
        500,
        "네이버 API 키가 설정되지 않았습니다.",
      );
    }

    return { clientId, clientSecret };
  }

  private buildSearchUrl(params: ProductSearchParams) {
    const url = new URL(this.shopSearchUrl);
    url.searchParams.set("query", params.query);
    url.searchParams.set("display", String(params.display ?? 10));
    url.searchParams.set("start", String(params.start ?? 1));
    url.searchParams.set("sort", params.sort ?? "sim");
    return url;
  }

  private async toError(response: Response) {
    const errorBody = (await response
      .json()
      .catch(() => ({}))) as NaverErrorResponse;

    if (errorBody.errorCode === "SE05") {
      return new ProductServiceError(
        ProductErrorCode.NAVER_SHOP_UNAVAILABLE,
        404,
        "네이버 쇼핑 검색 API는 2026년 7월 31일 종료되어 더 이상 사용할 수 없습니다.",
      );
    }

    return new ProductServiceError(
      ProductErrorCode.NAVER_SHOP_FAILED,
      response.status,
      errorBody.errorMessage ?? "네이버 쇼핑 검색에 실패했습니다.",
    );
  }
}

export const naverShopClient = new NaverShopClient();
