export default function ProductItem() {
  return (
    <li>
      <article className="flex flex-col gap-4 border border-gray-300 rounded-xl p-4">
        <div className="w-full h-40 bg-gray-200 rounded-xl">
          <img
            className="w-full h-full object-cover rounded-xl"
            src="https://placehold.co/600x400"
            alt="상품 이미지"
          />
        </div>
        <div className="">
          <h2 className="text-lg font-bold">상품 이름</h2>
          <p className="text-sm text-gray-500">89,000원</p>
          <p className="text-sm text-gray-500">인기</p>
          <p className="text-sm text-gray-500">전자기기</p>
        </div>
      </article>
    </li>
  );
}
