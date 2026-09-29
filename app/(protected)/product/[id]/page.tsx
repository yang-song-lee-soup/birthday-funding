import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/component/common/Badge/Badge";
import { ProductExternalAPI } from "@/service/product/product.external";
import ProductErrorToast from "../_component/product-error-toast";
import { formatPrice } from "../../../../utils/price";
import { ProductPageService } from "../product.page.service";

export default async function ProductDetailPage({
  params
}: PageProps<"/product/[id]">) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const productService = new ProductPageService();

  const [product, error] = await productService.getProduct(productId);

  if (error) {
    return <ProductErrorToast message={error.message} />;
  }

  if (!product) {
    notFound();
  }

  return (
    <section className="px-8 py-8">
      <Link
        href="/product"
        className="inline-flex items-center text-heading-5 text-content"
        aria-label="상품 목록으로"
      >
        ←
      </Link>
      <div className="mt-8 flex flex-col gap-10 md:flex-row">
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-surface bg-canvas md:w-lg">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="mt-3 text-heading-4">{product.title}</h1>
          <p className="mt-3 text-heading-3">{formatPrice(product.price)}</p>
          <dl className="mt-10 space-y-4 text-body">
            <div className="flex justify-between gap-4 border-b border-border py-3">
              <dt className="text-content-muted">브랜드</dt>
              <dd>{product.brand ?? "-"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border py-3">
              <dt className="text-content-muted">카테고리</dt>
              <dd>{product.category}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border py-3">
              <dt className="text-content-muted">재고</dt>
              <dd>{product.stock}</dd>
            </div>
          </dl>
          <p className="mt-6 text-body-small text-content-muted">
            {product.description}
          </p>
        </div>
      </div>
    </section>
  );
}
