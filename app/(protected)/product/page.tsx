"use client";

import ProductList from "./_component/product-list";
import { ProductService } from "./product.service";
import { ProductBffAPI } from "@/service/product/product.bff";
import BaseButton from "@/component/common/Button/BaseButton";
import { CATEGORIES } from "@/constants/categories";
import { useToastMessageContext } from "@/providers/ToastMessageProvider";
import { useEffect, useState } from "react";
import { ProductListType } from "@/service/product/product.interface";

export default function ProductPage({ searchParams }: PageProps<"/product">) {
  const productService = new ProductService(new ProductBffAPI());
  const [products, setProducts] = useState({} as ProductListType);
  const { showToastMessage } = useToastMessageContext();

  useEffect(() => {
    const getProducts = async () => {
      const [products, error] = await productService.getProducts();
      if (error) {
        showToastMessage({ type: "error", message: error.message });
        return;
      }
      setProducts(products);
    };
    getProducts();
  }, []);

  console.log(products);

  return (
    <section className="px-8 py-16">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-5xl font-bold">상품 관리</h1>
        <form action="/product" className="flex items-center gap-2">
          <input
            type="search"
            name="query"
            placeholder="상품명을 검색하세요"
            className="border border-gray-300 rounded-xl p-4 text-2xl"
          />
          <BaseButton size="lg" color="primary-500" type="submit">
            상품 검색
          </BaseButton>
        </form>
      </div>
      <div className="h-px bg-gray-300 my-4"></div>
      <div className="flex gap-2">
        {/* {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <span
              key={category}
              className={`text-2xl ${isActive ? "font-bold" : ""}`}
            >
              {category}
            </span>
          );
        })} */}
      </div>
      <ProductList products={[]} />
    </section>
  );
}
