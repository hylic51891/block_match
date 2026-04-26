type LogPayload = Record<string, unknown> | undefined;

function formatMessage(module: string, event: string, payload?: LogPayload): string {
  const ts = new Date().toISOString().slice(11, 23);
  let msg = `[${ts}][${module}] ${event}`;
  if (payload) msg += ` ${JSON.stringify(payload)}`;
  return msg;
}

const isDev = typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV;

export const logger = {
  debug(module: string, event: string, payload?: LogPayload) {
    if (isDev) console.log(formatMessage(module, event, payload));
  },
  info(module: string, event: string, payload?: LogPayload) {
    console.info(formatMessage(module, event, payload));
  },
  warn(module: string, event: string, payload?: LogPayload) {
    console.warn(formatMessage(module, event, payload));
  },
  error(module: string, event: string, payload?: LogPayload) {
    console.error(formatMessage(module, event, payload));
  },
};
