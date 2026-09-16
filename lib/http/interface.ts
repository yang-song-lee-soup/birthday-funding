import type { HttpService } from "./service";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpQuery = Record<string, string | number | boolean | undefined>;

export type HttpRequestOptions = Pick<
  RequestInit,
  "headers" | "cache" | "signal"
> & {
  query?: HttpQuery;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export type HttpRequestConfig = {
  baseUrl: string;
  headers?: HeadersInit;
  method: HttpMethod;
  path: string;
  body?: unknown;
  options?: HttpRequestOptions;
};

export interface HttpRequestBuilder<T> {
  request(): Promise<T>;
}

export interface HttpClientInterface {
  get<T>(path: string, options?: HttpRequestOptions): HttpRequestBuilder<T>;
  post<T>(
    path: string,
    body?: unknown,
    options?: HttpRequestOptions
  ): HttpRequestBuilder<T>;
  put<T>(
    path: string,
    body?: unknown,
    options?: HttpRequestOptions
  ): HttpRequestBuilder<T>;
  patch<T>(
    path: string,
    body?: unknown,
    options?: HttpRequestOptions
  ): HttpRequestBuilder<T>;
  delete<T>(path: string, options?: HttpRequestOptions): HttpRequestBuilder<T>;
}

export type CreateHttpClientConfig = {
  service: HttpService;
  headers?: HeadersInit;
};
