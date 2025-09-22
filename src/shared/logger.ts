// Simple namespaced logger with LogSeverity control via env LOG_LogSeverity
export type LogSeverity = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'all';
const order: Record<LogSeverity, number> = { silent: 5, error: 4, warn: 3, info: 2, debug: 1, all: 0 };

export function getLogLogSeverity(): LogSeverity {
  const raw = (process.env.LOG_LogSeverity ?? 'info').toLowerCase();
  return (['silent','error','warn','info','debug', 'all'] as LogSeverity[]).includes(raw as LogSeverity) ? (raw as LogSeverity) : 'info';
}

export function createLogger(ns: string, LogSeverity: LogSeverity = getLogLogSeverity()) {
  const should = (lvl: LogSeverity) => order[lvl] >= order[LogSeverity];
  const ts = () => new Date().toISOString();
  const tag = (lvl: string) => `${ts()} [${lvl}] [${ns}]`;

  return {
    setLogSeverity(l: LogSeverity) { LogSeverity = l; },
    debug: (...a: any[]) => { if (should('debug')) console.log(tag('DBG'), ...a); },
    info : (...a: any[]) => { if (should('info'))  console.log(tag('INF'), ...a); },
    warn : (...a: any[]) => { if (should('warn'))  console.warn(tag('WRN'), ...a); },
    error: (...a: any[]) => { if (should('error')) console.error(tag('ERR'), ...a); },
  };
}