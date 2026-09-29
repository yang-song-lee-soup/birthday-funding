import { ProductExternalAPI } from "@/service/product/product.external";

export class ProductPageService {
  private readonly productExternalAPI = new ProductExternalAPI();

  async getProducts() {
    return await this.productExternalAPI.getAll().requestWithResult();
  }

  async searchProducts(query: string) {
    return await this.productExternalAPI.search(query).requestWithResult();
  }

  async getProductsByCategory(category: string) {
    return await this.productExternalAPI
      .getByCategory(category)
      .requestWithResult();
  }

  async getProduct(id: number) {
    return await this.productExternalAPI.getById(id).requestWithResult();
  }
}
