export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static notFound(resource: string, id: string): AppError {
    return new AppError(404, `${resource} with id "${id}" was not found`);
  }
}
