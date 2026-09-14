import { naverShopClient } from "./product.client";
import type {
  ProductSearchParams,
  ProductSearchResult,
} from "./product.interface";
import { assertProductQuery, mapNaverItemToProduct } from "./product.util";

export class ProductService {
  async getAll(params: ProductSearchParams): Promise<ProductSearchResult> {
    assertProductQuery(params.query);

    const data = await naverShopClient.getAll(params);

    return {
      total: data.total,
      start: data.start,
      display: data.display,
      items: data.items.map(mapNaverItemToProduct),
    };
  }
}

export const productService = new ProductService();
