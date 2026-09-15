import { AppError, type ErrorResponse } from "../app/app-error";

export async function catchError(response: Response) {
  if (response.ok) {
    return;
  }

  const data = (await response.json().catch(() => ({}))) as Partial<ErrorResponse>;

  throw new AppError({
    service: data.service ?? "http",
    error: data.error ?? "HTTP_ERROR",
    status: response.status,
    message: data.message ?? response.statusText ?? "Request failed",
  });
}

