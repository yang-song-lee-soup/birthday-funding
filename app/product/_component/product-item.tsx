import type { Product } from "@/app/service/product/product.interface";

export default function ProductItem({ product }: { product: Product }) {
  const price = new Intl.NumberFormat("ko-KR").format(product.price);

  return (
    <li>
      <a href={product.link} target="_blank" rel="noopener noreferrer">
        <article className="flex flex-col gap-4 border border-gray-300 rounded-xl p-4">
          <div className="w-full h-40 bg-gray-200 rounded-xl">
            <img
              className="w-full h-full object-cover rounded-xl"
              src={product.image}
              alt={product.title}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold line-clamp-2">{product.title}</h2>
            <p className="text-sm text-gray-500">{price}원</p>
            <p className="text-sm text-gray-500">{product.mallName}</p>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
        </article>
      </a>
    </li>
  );
}
