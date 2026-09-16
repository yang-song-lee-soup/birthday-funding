import { extractError, type ServiceResult } from "@/lib/app/app-error";
import { ProductAPI } from "@/service/product/product.bff";
import { ProductListResponse } from "./product.interface";

export class ProductService extends ProductAPI {
  async getProducts(): Promise<ServiceResult<ProductListResponse>> {
    try {
      const res = await this.getAll();

      return [res, null];
    } catch (e) {
      return [null, extractError(e)];
    }
  }
}
