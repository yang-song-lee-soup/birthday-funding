import type { Product, ProductDto, ProductList, ProductListDto } from "./product.interface";

export function toProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    category: dto.category,
    brand: dto.brand,
    price: dto.price,
    rating: dto.rating,
    stock: dto.stock,
    thumbnail: dto.thumbnail
  };
}

export function toProductList(dto: ProductListDto): ProductList {
  return {
    products: dto.products.map(toProduct),
    total: dto.total,
    skip: dto.skip,
    limit: dto.limit
  };
}
