export class ValidationError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(public resetAt: Date) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

export class AITimeoutError extends Error {
  constructor() {
    super('AI request timed out');
    this.name = 'AITimeoutError';
  }
}
