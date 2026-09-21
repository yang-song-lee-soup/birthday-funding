import { catchError } from "./error";
import { HttpQuery, HttpRequestBuilder, HttpRequestConfig } from "./interface";

export class HttpRequest<T> implements HttpRequestBuilder<T> {
  constructor(private readonly config: HttpRequestConfig) {}

  async request(): Promise<T> {
    return this.execute();
  }

  private async execute(): Promise<T> {
    const { method, path, body, options = {} } = this.config;
    const { headers, query, cache, signal, next } = options;
    const url = this.buildUrl(path, query);

    const response = await fetch(url, {
      method,
      headers: await this.resolveHeaders(headers),
      body: body === undefined ? undefined : JSON.stringify(body),
      cache,
      signal,
      next
    });

    await catchError(response);

    return this.parseBody(response);
  }

  private buildUrl(path: string, query?: HttpQuery) {
    const url = new URL(this.config.baseUrl + path);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url;
  }

  private async resolveHeaders(extra?: HeadersInit) {
    const headers = new Headers(this.config.headers);

    this.appendHeaders(headers, await this.config.getHeaders?.());
    this.appendHeaders(headers, extra);

    return headers;
  }

  private appendHeaders(headers: Headers, extra?: HeadersInit) {
    if (!extra) {
      return;
    }

    new Headers(extra).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  private async parseBody(response: Response): Promise<T> {
    const text = await response.text();

    return text ? (JSON.parse(text) as T) : (undefined as T);
  }
}
