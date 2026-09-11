import ProductList from "./_component/product-list";

export default function ProductPage() {
  return (
    <section className="px-4 py-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <button className="bg-yellow-300 px-4 py-1 rounded-md">
          <span className="text-sm font-bold">상품 검색</span>
        </button>
      </div>
      <div className="h-px bg-gray-300 my-4"></div>
      <div className="flex gap-2">
        <div className="bg-yellow-100 px-4 py-1 rounded-2xl border border-gray-300">
          <span className="text-sm font-bold">전체</span>
        </div>
        <div className="bg-gray-100 px-4 py-1 rounded-2xl border border-gray-300">
          <span className="text-sm">전자기기</span>
        </div>
        <div className="bg-gray-100 px-4 py-1 rounded-2xl border border-gray-300">
          <span className="text-sm">패션/장화</span>
        </div>
        <div className="bg-gray-100 px-4 py-1 rounded-2xl border border-gray-300">
          <span className="text-sm">생활/주방</span>
        </div>
        <div className="bg-gray-100 px-4 py-1 rounded-2xl border border-gray-300">
          <span className="text-sm">뷰티/화장품</span>
        </div>
        <div className="bg-gray-100 px-4 py-1 rounded-2xl border border-gray-300">
          <span className="text-sm">기타</span>
        </div>
      </div>
      <ProductList />
    </section>
  );
}
