export class AppError extends Error {
  public readonly statusCode: number;
  public readonly fields?: Record<string, string>;

  constructor(message: string, statusCode = 400, fields?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new AppError(message, 400, fields);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Not found") {
    return new AppError(message, 404);
  }

  static conflict(message: string, fields?: Record<string, string>) {
    return new AppError(message, 409, fields);
  }
}
