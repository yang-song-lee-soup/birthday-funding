import { HttpRequest } from "./request";
import type {
  CreateHttpClientConfig,
  HttpClientInterface,
  HttpRequestOptions
} from "./interface";

export class HttpClient implements HttpClientInterface {
  constructor(
    private readonly baseUrl: string,
    private readonly headers: HeadersInit = {}
  ) {}

  get<T>(path: string, options?: HttpRequestOptions) {
    return new HttpRequest<T>({
      baseUrl: this.baseUrl,
      headers: this.headers,
      method: "GET",
      path,
      options
    });
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions) {
    return new HttpRequest<T>({
      baseUrl: this.baseUrl,
      headers: this.headers,
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
      method: "DELETE",
      path,
      options
    });
  }
}
