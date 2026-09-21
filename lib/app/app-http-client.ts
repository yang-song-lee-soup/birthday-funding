import { HttpFetch, HttpService, type HttpClientInterface } from "../http";

export function createAppHttpClient(): HttpClientInterface {
  return HttpFetch({ service: HttpService.APP });
}

export function createProductHttpClient(): HttpClientInterface {
  return HttpFetch({ service: HttpService.PRODUCT });
}
