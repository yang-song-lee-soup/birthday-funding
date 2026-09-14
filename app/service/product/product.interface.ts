export type ProductSort = "sim" | "date" | "asc" | "dsc";

export type ProductSearchParams = {
  query: string;
  display?: number;
  start?: number;
  sort?: ProductSort;
};

export type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  mallName: string;
  category: string;
  link: string;
};

export type ProductSearchResult = {
  total: number;
  start: number;
  display: number;
  items: Product[];
};

export type NaverShopItem = {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  productType: string;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
};

export type NaverShopSearchResponse = {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverShopItem[];
};

export type NaverErrorResponse = {
  errorMessage?: string;
  errorCode?: string;
};
