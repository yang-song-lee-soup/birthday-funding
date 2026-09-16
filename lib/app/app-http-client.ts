import { HttpFetch, HttpService, type HttpClientInterface } from "../http";

export function createAppHttpClient(): HttpClientInterface {
  return HttpFetch({ service: HttpService.APP });
}
