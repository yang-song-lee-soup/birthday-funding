export type ProductSearchParams = {
  query?: string;
  limit?: number;
  skip?: number;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
};

export type ProductList = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};
