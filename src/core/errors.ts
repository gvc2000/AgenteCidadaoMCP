export class CamaraAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CamaraAPIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(
    message: string = 'Circuit breaker is open',
    public endpoint?: string
  ) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string = 'Request timeout',
    public timeoutMs?: number
  ) {
    super(message);
    this.name = 'TimeoutError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof CamaraAPIError) {
    // Retry em erros 5xx e alguns 4xx
    return (
      (error.statusCode !== undefined && error.statusCode >= 500) ||
      error.statusCode === 429 ||
      error.statusCode === 408
    );
  }

  if (error instanceof TimeoutError) {
    return true;
  }

  // Erros de rede são retryable
  if (error instanceof Error) {
    const networkErrors = [
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'EHOSTUNREACH'
    ];
    return networkErrors.some(code => error.message.includes(code));
  }

  return false;
}

export function handleError(error: unknown): never {
  if (error instanceof CamaraAPIError) {
    throw error;
  }

  if (error instanceof ValidationError) {
    throw error;
  }

  if (error instanceof RateLimitError) {
    throw error;
  }

  if (error instanceof CircuitBreakerOpenError) {
    throw error;
  }

  if (error instanceof TimeoutError) {
    throw error;
  }

  // Erro desconhecido
  if (error instanceof Error) {
    throw new CamaraAPIError(
      `Erro inesperado: ${error.message}`,
      undefined,
      undefined,
      error
    );
  }

  throw new CamaraAPIError(
    'Erro desconhecido',
    undefined,
    undefined,
    error
  );
}
