type Fields = Record<string, unknown>;

export function log(level: 'info' | 'warn' | 'error', message: string, fields: Fields = {}) {
  const safeFields = { ...fields };
  for (const key of Object.keys(safeFields)) {
    if (/password|token|secret|authorization/i.test(key)) safeFields[key] = '[redacted]';
  }
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    JSON.stringify({ level, message, time: new Date().toISOString(), ...safeFields })
  );
}
