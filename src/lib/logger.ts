import {inspect} from 'util';
import stackTrace from 'stack-trace';

export class Logger {

  private static stringify(...message: unknown[]): string[] {
    return message.map(m => {
      if (m instanceof Object) {
        try { return JSON.stringify(m); } catch { return inspect(m, {colors: true}); }
      }
      return String(m);
    });
  }

  static fatal(...message: unknown[]): never {
    const trace = stackTrace.get();
    console.error(new Date(), '[FATAL]', `${trace[1].getFileName()}@${trace[1].getFunctionName()}:${trace[1].getLineNumber()}`);
    console.error(new Date(), '[FATAL]', Logger.stringify(...message).join(' '));
    process.exit(1);
  }

  static error(...message: unknown[]) {
    console.error(new Date(), '[ERROR]', ...message);
  }

  static warning(...message: unknown[]) {
    console.warn(new Date(), '[WARNING]', ...message);
  }

  static info(...message: unknown[]) {
    console.log(new Date(), '[INFO]', ...message);
  }

  static success(...message: unknown[]) {
    console.log(new Date(), '[SUCCESS]', ...message);
  }

  static secondary(...message: unknown[]) {
    console.log(new Date(), ...message);
  }

  static primary(...message: unknown[]) {
    console.log(new Date(), ...message);
  }

  static debug(...message: unknown[]) {
    const trace = stackTrace.get();
    console.log(new Date(), '[DEBUG]', `${trace[1].getFileName()}@${trace[1].getFunctionName()}:${trace[1].getLineNumber()}`);
    console.log(new Date(), '       ', Logger.stringify(...message).join(' '));
  }
}