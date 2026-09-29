export const CATEGORIES = [
  { label: "전체", slug: null },
  { label: "전자기기", slug: "smartphones" },
  { label: "패션/잡화", slug: "tops" },
  { label: "생활/주방", slug: "furniture" },
  { label: "뷰티/화장품", slug: "beauty" },
  { label: "기타", slug: "groceries" }
] as const;

export type CategorySlug = Exclude<(typeof CATEGORIES)[number]["slug"], null>;
