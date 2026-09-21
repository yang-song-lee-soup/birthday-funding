import { ProductExternalAPI } from "@/service/product/product.external";
import ProductAdminShell from "./_component/product-admin-shell";
import ProductCategories from "./_component/product-categories";
import ProductErrorToast from "./_component/product-error-toast";
import ProductList from "./_component/product-list";
import ProductSearch from "./_component/product-search";
import { ProductService } from "./product.service";

export default async function ProductPage({
  searchParams
}: PageProps<"/product">) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const selectedCategory =
    typeof params.category === "string" ? params.category : "";
  const productService = new ProductService(new ProductExternalAPI());
  const [products, error] = query
    ? await productService.searchProducts(query)
    : selectedCategory
      ? await productService.getProductsByCategory(selectedCategory)
      : await productService.getProducts();

  return (
    <ProductAdminShell>
      <ProductSearch query={query} />
      <ProductCategories selectedCategory={selectedCategory} />
      {error ? <ProductErrorToast message={error.message} /> : null}
      <ProductList products={products?.products ?? []} />
    </ProductAdminShell>
  );
}
