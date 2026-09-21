import { CATEGORIES } from "@/constants/categories";
import Link from "next/link";

export default function ProductCategories({
  selectedCategory
}: {
  selectedCategory: string;
}) {
  const categoriesContent = CATEGORIES.map(({ label, slug }) => {
    const isActive = (slug ?? "") === selectedCategory;
    const href = slug
      ? `/product?category=${encodeURIComponent(slug)}`
      : "/product";

    return { label, href, isActive };
  });

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {categoriesContent.map(({ label, href, isActive }) => (
        <Link
          href={href}
          key={label}
          className={`rounded-full border px-6 py-2 text-body-small ${
            isActive
              ? "border-kakao bg-kakao font-bold text-kakao-content"
              : "border-border bg-surface text-content-muted"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
