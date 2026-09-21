import { extractError, type ErrorResponse } from "./app-error";

export type ServiceResult<T> =
  | readonly [T, null]
  | readonly [null, ErrorResponse];

export async function toResult<T>(
  promise: Promise<T>
): Promise<ServiceResult<T>> {
  try {
    return [await promise, null];
  } catch (e) {
    return [null, extractError(e)];
  }
}
