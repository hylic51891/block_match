export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type SettlementRequest = {
  result: 'success' | 'failed';
  durationMs: number;
  moveCount: number;
  shuffleUsed: number;
  star: number;
};

export type TelemetryEventPayload = {
  event: string;
  timestamp: number;
  properties?: Record<string, unknown>;
};
