import { logger } from './logger';

export type ErrorEvent = {
  module: string;
  message: string;
  stack?: string;
  extra?: Record<string, unknown>;
  timestamp: number;
};

export function reportError(module: string, message: string, extra?: Record<string, unknown>): void {
  const event: ErrorEvent = {
    module,
    message,
    stack: new Error().stack,
    extra,
    timestamp: Date.now(),
  };
  logger.error('ErrorReporter', 'error_reported', event as unknown as Record<string, unknown>);
}
