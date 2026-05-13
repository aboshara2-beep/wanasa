export class ApiError extends Error {
  constructor(
    public status:  number,
    public message: string,
    public code?:   string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() { return this.status === 401; }
  get isForbidden()    { return this.status === 403; }
  get isNotFound()     { return this.status === 404; }
  get isRateLimit()    { return this.status === 429; }
  get isServer()       { return this.status >= 500; }
}

export function parseError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error)
    return new ApiError(0, err.message);
  return new ApiError(0, 'خطأ غير متوقع');
}
