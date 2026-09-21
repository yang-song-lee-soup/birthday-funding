import Link from "next/link";
import Badge from "@/component/common/Badge/Badge";
import type { Product } from "@/service/product/product.interface";
import { formatPrice } from "../../../../utils/price";

export default function ProductItem({ product }: { product: Product }) {
  return (
    <li>
      <article className="flex h-full flex-col rounded-surface border border-border bg-surface p-6 shadow-surface">
        <Link href={`/product/${product.id}`} className="block">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-surface bg-canvas">
            <img
              className="h-full w-full object-contain"
              src={product.thumbnail}
              alt={product.title}
            />
          </div>
          {product.category ? (
            <Badge className="mt-5">{product.category}</Badge>
          ) : null}
          <h2 className="mt-3 line-clamp-2 text-body font-bold">
            {product.title}
          </h2>
          <p className="mt-2 text-heading-6">{formatPrice(product.price)}</p>
        </Link>
      </article>
    </li>
  );
}
