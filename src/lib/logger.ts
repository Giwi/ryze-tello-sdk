import {inspect} from 'util';
import stackTrace from 'stack-trace';

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
    const trace = stackTrace.get();
    console.error(new Date(), '[FATAL]', `${trace[1].getFileName()}@${trace[1].getFunctionName()}:${trace[1].getLineNumber()}`);
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
    const trace = stackTrace.get();
    console.log(new Date(), '[DEBUG]', `${trace[1].getFileName()}@${trace[1].getFunctionName()}:${trace[1].getLineNumber()}`);
    console.log(new Date(), '       ', Logger.stringify(...message).join(' '));
  }
}