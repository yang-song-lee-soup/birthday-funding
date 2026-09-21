export default function ProductSearch({ query }: { query: string }) {
  return (
    <form action="/product" className="max-w-xl">
      <label className="sr-only" htmlFor="product-query">
        상품명 검색
      </label>
      <input
        id="product-query"
        type="search"
        name="query"
        defaultValue={query}
        placeholder="상품명을 검색하세요"
        className="h-button-lg w-full rounded-full border border-border bg-surface px-8 text-body outline-none focus:border-content"
      />
    </form>
  );
}
