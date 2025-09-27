// Simple namespaced logger with LogSeverity control via env LOG_LogSeverity
export type Level = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'all';
const order: Record<Level, number> = { silent: 5, error: 4, warn: 3, info: 2, debug: 1, all: 0 };

export function getLogLogSeverity(): Level {
  const raw = (process.env.LOG_LogSeverity ?? 'info').toLowerCase();
  return (['silent','error','warn','info','debug', 'all'] as Level[]).includes(raw as Level) ? (raw as Level) : 'info';
}

export function createLogger(ns: string, level: Level = getLogLogSeverity(),sink?: string[]) {
  const should = (lvl: Level) => order[lvl] >= order[level];
  const ts = () => new Date().toISOString();
  const tag = (lvl: string) => `${ts()} [${lvl}] [${ns}]`;
 const write = (lvl : Level, out: (...args: any[]) => void, ...a: any[]) => {
    if (!should(lvl)) return;
    const line = `${tag(lvl.toUpperCase())} ${a.join(' ')} \n`;
    out(line);
    if (sink) sink.push(line);
  };


  return {
    setLevel(l: Level) { level = l; },
    debug: (...a: any[]) => write('debug', console.log, ...a),
    info : (...a: any[]) => write('info',  console.log, ...a),
    warn : (...a: any[]) => write('warn',  console.warn, ...a),
    error: (...a: any[]) => write('error', console.error, ...a),
  };
}