import { logger } from './logger';

export type ErrorCategory =
  | 'core_logic'
  | 'platform_adapter'
  | 'storage_parse'
  | 'challenge_config'
  | 'ad_service'
  | 'share_service'
  | 'auth_service'
  | 'unknown';

export type ErrorEvent = {
  category: ErrorCategory;
  module: string;
  message: string;
  stack?: string;
  extra?: Record<string, unknown>;
  timestamp: number;
};

export function reportError(category: ErrorCategory, module: string, message: string, extra?: Record<string, unknown>): void {
  const event: ErrorEvent = {
    category,
    module,
    message,
    stack: new Error().stack,
    extra,
    timestamp: Date.now(),
  };
  logger.error('ErrorReporter', 'error_reported', event as unknown as Record<string, unknown>);
}
