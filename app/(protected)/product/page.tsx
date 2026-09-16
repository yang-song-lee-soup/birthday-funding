import { ProductExternalAPI } from "@/service/product/product.external";
import ProductList from "./_component/product-list";
import { ProductService } from "./product.service";

const CATEGORIES = [
  "전체",
  "전자기기",
  "패션/잡화",
  "생활/주방",
  "뷰티/화장품",
  "기타"
] as const;

export default async function ProductPage({
  searchParams
}: PageProps<"/product">) {
  const productService = new ProductService(new ProductExternalAPI());
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const selectedCategory =
    typeof params.category === "string" ? params.category : "전체";

  let errorMessage = "";

  const [res, err] = await productService.getProducts();

  if (err) {
    errorMessage = err.message;
  }

  return (
    <section className="px-4 py-8">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <form action="/product" className="flex items-center gap-2">
          <input
            type="search"
            name="query"
            defaultValue={query}
            placeholder="상품명을 검색하세요"
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          />
          <button type="submit" className="bg-yellow-300 px-4 py-1 rounded-md">
            <span className="text-sm font-bold">상품 검색</span>
          </button>
        </form>
      </div>
      <div className="h-px bg-gray-300 my-4"></div>
      <div className="flex gap-2">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          const href =
            category === "전체"
              ? query
                ? `/product?query=${encodeURIComponent(query)}`
                : "/product"
              : `/product?query=${encodeURIComponent(category)}&category=${encodeURIComponent(category)}`;

          return (
            <a
              key={category}
              href={href}
              className={`${isActive ? "bg-yellow-100" : "bg-gray-100"} px-4 py-1 rounded-2xl border border-gray-300`}
            >
              <span className={`text-sm ${isActive ? "font-bold" : ""}`}>
                {category}
              </span>
            </a>
          );
        })}
      </div>
      {errorMessage ? (
        <p className="mt-8 text-sm text-red-500">{errorMessage}</p>
      ) : (
        <ProductList products={res?.products ?? []} />
      )}
    </section>
  );
}
