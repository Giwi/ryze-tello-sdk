import {inspect} from 'util';

function callerInfo(): string {
  const lines = new Error().stack?.split('\n') ?? [];
  // lines[0] = "Error", lines[1] = current method (fatal/debug), lines[2] = caller
  const m = lines[2]?.match(/\s+at\s+(?:\w+\s+)?\(?(.+?):(\d+):\d+\)?$/);
  return m ? `${m[1]}@${m[2]}` : 'unknown';
}

/** Static logging utility with timestamped levels: fatal, error, warning, info, success, debug. */
export class Logger {

  private static stringify(...message: unknown[]): string[] {
    return message.map(m => {
      if (m instanceof Object) {
        try { return JSON.stringify(m); } catch { return inspect(m, {colors: true}); }
      }
      return String(m);
    });
  }

  /** Log an error message and exit the process. */
  static fatal(...message: unknown[]): never {
    console.error(new Date(), '[FATAL]', callerInfo());
    console.error(new Date(), '[FATAL]', Logger.stringify(...message).join(' '));
    process.exit(1);
  }

  /** Log an error message. */
  static error(...message: unknown[]) {
    console.error(new Date(), '[ERROR]', ...message);
  }

  /** Log a warning message. */
  static warning(...message: unknown[]) {
    console.warn(new Date(), '[WARNING]', ...message);
  }

  /** Log an info message. */
  static info(...message: unknown[]) {
    console.log(new Date(), '[INFO]', ...message);
  }

  /** Log a success message. */
  static success(...message: unknown[]) {
    console.log(new Date(), '[SUCCESS]', ...message);
  }

  /** Log a secondary message (no level tag). */
  static secondary(...message: unknown[]) {
    console.log(new Date(), ...message);
  }

  /** Log a primary message (no level tag). */
  static primary(...message: unknown[]) {
    console.log(new Date(), ...message);
  }

  /** Log a debug message with file/function/line source information. */
  static debug(...message: unknown[]) {
    console.log(new Date(), '[DEBUG]', callerInfo());
    console.log(new Date(), '       ', Logger.stringify(...message).join(' '));
  }
}