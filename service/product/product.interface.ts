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

export type ProductDimensionsDto = {
  width: number;
  height: number;
  depth: number;
};

export type ProductReviewDto = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type ProductMetaDto = {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
};

export type ProductDto = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensionsDto;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReviewDto[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMetaDto;
  thumbnail: string;
  images: string[];
};

export type ProductListDto = {
  products: ProductDto[];
  total: number;
  skip: number;
  limit: number;
};
