export type AppErrorOptions = {
  service: string;
  code: string;
  status: number;
  message: string;
};

export class AppError extends Error {
  readonly service: string;
  readonly code: string;
  readonly status: number;

  constructor({ service, code, status, message }: AppErrorOptions) {
    super(message);
    this.name = "AppError";
    this.service = service;
    this.code = code;
    this.status = status;
  }
}
