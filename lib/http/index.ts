import { HttpClient } from "./client";
import { CreateHttpClientConfig } from "./interface";
import { getServiceOrigin } from "./service";
export { HttpService, getServiceOrigin } from "./service";
export type { HttpRequest } from "./request";
export type {
  CreateHttpClientConfig,
  HttpClientInterface,
  HttpMethod,
  HttpQuery,
  HttpRequestBuilder,
  HttpRequestConfig,
  HttpRequestOptions
} from "./interface";

export function HttpFetch({ service, headers }: CreateHttpClientConfig) {
  const defaultHeaders = new Headers({
    "Content-Type": "application/json"
  });

  if (headers) {
    new Headers(headers).forEach((value, key) => {
      defaultHeaders.set(key, value);
    });
  }

  return new HttpClient(getServiceOrigin(service), defaultHeaders);
}
