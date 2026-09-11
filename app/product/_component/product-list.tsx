import ProductItem from "./product-item";

export default function ProductList() {
  return (
    <ul className="mt-8 grid grid-cols-4 gap-4">
      {[...Array(10)].map((_, idx) => (
        <ProductItem key={idx} />
      ))}
    </ul>
  );
}
