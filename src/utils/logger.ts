export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Capture original console methods to avoid recursion when overriding
const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug ? console.debug.bind(console) : console.log.bind(console),
};

class Logger {
  private static format(level: LogLevel, args: any[]): string {
    const prefix = `[${level}]`;
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
    return `${prefix} ${message}`;
  }

  public static debug(...args: any[]): void {
    originalConsole.debug(Logger.format(LogLevel.DEBUG, args));
  }

  public static info(...args: any[]): void {
    originalConsole.log(Logger.format(LogLevel.INFO, args));
  }

  public static warn(...args: any[]): void {
    originalConsole.warn(Logger.format(LogLevel.WARN, args));
  }

  public static error(...args: any[]): void {
    originalConsole.error(Logger.format(LogLevel.ERROR, args));
  }
}

export default Logger; 