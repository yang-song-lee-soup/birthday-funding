export type ErrorResponse = {
  service: string;
  error: string;
  status: number;
  message: string;
};

export type ServiceResult<T> =
  | readonly [T, null]
  | readonly [null, ErrorResponse];

export class AppError extends Error {
  readonly service: string;
  readonly error: string;
  readonly status: number;

  constructor({ service, error, status, message }: ErrorResponse) {
    super(message);
    this.name = "AppError";
    this.service = service;
    this.error = error;
    this.status = status;
  }

  toJSON(): ErrorResponse {
    return {
      service: this.service,
      error: this.error,
      status: this.status,
      message: this.message
    };
  }
}

export function extractError(e: unknown): ErrorResponse {
  if (e instanceof AppError) {
    return e.toJSON();
  }

  if (e instanceof Error) {
    return {
      service: "unknown",
      status: 500,
      message: e.message,
      error: "INTERNAL_ERROR"
    };
  }

  return {
    service: "unknown",
    status: 500,
    message: "Unknown Error",
    error: "UNKNOWN_ERROR"
  };
}
