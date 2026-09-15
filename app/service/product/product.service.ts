import { extractError, type ServiceResult } from "@/lib/app/app-error";
import { AppService } from "@/lib/app/app-service";
import type {
  ProductSearchParams,
  ProductSearchResult
} from "./product.interface";

export class ProductService extends AppService {
  async getAll(
    params: ProductSearchParams
  ): Promise<ServiceResult<ProductSearchResult>> {
    try {
      const res = await this.httpClient
        .get<ProductSearchResult>("/api/product", {
          query: {
            query: params.query,
            display: params.display,
            start: params.start,
            sort: params.sort
          }
        })
        .request();

      return [res, null];
    } catch (e) {
      return [null, extractError(e)];
    }
  }
}
