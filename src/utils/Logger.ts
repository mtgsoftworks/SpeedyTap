class Logger {
  private static isDev = import.meta.env.MODE === 'development';

  static log(...args: any[]): void {
    if (this.isDev) {
      console.log(...args);
    }
  }

  static warn(...args: any[]): void {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  static error(...args: any[]): void {
    // Errors are always logged
    console.error(...args);
  }

  static info(...args: any[]): void {
    if (this.isDev) {
      console.info(...args);
    }
  }
}

export default Logger; 