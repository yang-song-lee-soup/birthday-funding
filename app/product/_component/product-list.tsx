import type { Product } from "@/app/service/product/product.interface";
import ProductItem from "./product-item";

export default function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="mt-8 text-sm text-gray-500">검색된 상품이 없습니다.</p>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </ul>
  );
}
