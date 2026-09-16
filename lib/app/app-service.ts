import { HttpClientInterface, HttpFetch, HttpService } from "../http";

export class AppService {
  protected readonly httpClient: HttpClientInterface = HttpFetch({
    service: HttpService.APP
  });
}
