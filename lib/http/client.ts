import { HttpRequest } from "./request";
import type {
  HttpClientInterface,
  HttpHeadersProvider,
  HttpRequestOptions
} from "./interface";

export class HttpClient implements HttpClientInterface {
  constructor(
    private readonly baseUrl: string,
    private readonly headers: HeadersInit = {},
    private readonly getHeaders?: HttpHeadersProvider
  ) {}

  get<T>(path: string, options?: HttpRequestOptions) {
    return new HttpRequest<T>({
      baseUrl: this.baseUrl,
      headers: this.headers,
      getHeaders: this.getHeaders,
      method: "GET",
      path,
      options
    });
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions) {
    return new HttpRequest<T>({
      baseUrl: this.baseUrl,
      headers: this.headers,
      getHeaders: this.getHeaders,
      method: "POST",
      path,
      body,
      options
    });
  }

  put<T>(path: string, body?: unknown, options?: HttpRequestOptions) {
    return new HttpRequest<T>({
      baseUrl: this.baseUrl,
      headers: this.headers,
      getHeaders: this.getHeaders,
      method: "PUT",
      path,
      body,
      options
    });
  }

  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions) {
    return new HttpRequest<T>({
      baseUrl: this.baseUrl,
      headers: this.headers,
      getHeaders: this.getHeaders,
      method: "PATCH",
      path,
      body,
      options
    });
  }

  delete<T>(path: string, options?: HttpRequestOptions) {
    return new HttpRequest<T>({
      baseUrl: this.baseUrl,
      headers: this.headers,
      getHeaders: this.getHeaders,
      method: "DELETE",
      path,
      options
    });
  }
}
