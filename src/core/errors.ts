export class CamaraAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CamaraAPIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public validationErrors?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class CircuitBreakerError extends Error {
  constructor(message = 'Circuit breaker is open') {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
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

  if (error instanceof CircuitBreakerError) {
    throw error;
  }

  if (error instanceof TimeoutError) {
    throw error;
  }

  // Generic error
  throw new CamaraAPIError(
    error instanceof Error ? error.message : 'Unknown error',
    undefined,
    undefined,
    error
  );
}
