import { AppError } from "../app/app-error";

export async function catchError(response: Response) {
  if (response.ok) {
    return;
  }

  if (response.status === 401) {
    throw new AppError({
      service: "http",
      error: "UNAUTHORIZED",
      status: 401,
      message: "Authentication required"
    });
  }

  if (response.status === 403) {
    throw new AppError({
      service: "http",
      error: "FORBIDDEN",
      status: 403,
      message: "Access denied"
    });
  }

  throw new AppError({
    service: "http",
    error: "HTTP_ERROR",
    status: response.status,
    message: response.statusText || "Request failed"
  });
}
