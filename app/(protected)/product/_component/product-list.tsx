import type { Product } from "@/service/product/product.interface";
import ProductItem from "./product-item";

export default function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="mt-16 text-center text-body text-content-muted">
        검색된 상품이 없습니다.
      </p>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-2 gap-6">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </ul>
  );
}
