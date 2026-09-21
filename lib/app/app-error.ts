export type ErrorResponse = {
  service: string;
  error: string;
  status: number;
  message: string;
};

export class AppError extends Error {
  readonly service: string;
  readonly error: string;
  readonly status: number;

  constructor({ service, error, status, message }: ErrorResponse) {
    super(message);
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

  return {
    service: "unknown",
    status: 500,
    message: "Unknown Error",
    error: "UNKNOWN_ERROR"
  };
}
