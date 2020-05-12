/**
 *
 */
import * as util from "util";
import { get } from "stack-trace";

/**
 *
 */
export class Logger {

  /**
   *
   * @param message
   * @return {any[]}
   */
  private static stringify(...message: any) {
    const messages = [];
    if(message) {
      message.forEach(m => {
        if(m instanceof Object) {
          try {
            messages.push(JSON.stringify(m));
          } catch(e) {
            messages.push(util.inspect(m, { colors: true }));
          }
        } else {
          messages.push(m);
        }
      });
    }
    return messages;
  }

  /**
   *
   * @param message
   */
  static fatal(...message: any) {
    const trace = get();
    console.error(new Date(), '[FATAL]', `${trace[ 1 ].getFileName()}@${trace[ 1 ].getFunctionName()}:${trace[ 1 ].getLineNumber()}`);
    console.error(new Date(), '[FATAL]', Logger.stringify(message).join(' '));
    console.trace(new Date(), '[FATAL]', Logger.stringify(message).join(' '));
    process.exit(1);
  }

  /**
   *
   * @param message
   */
  static error(...message: any) {
    console.error(new Date(), '[ERROR]', message.join(' '));
  }

  /**
   *
   * @param message
   */
  static warning(...message: any[]) {
    console.warn(new Date(), '[WARNING]', message.join(' '));
  }

  /**
   *
   * @param message
   */
  static info(...message: any) {
    console.log(new Date(), '[INFO]', message.join(' '));
  }

  /**
   *
   * @param message
   */
  static success(...message: any) {
    console.log(new Date(), '[SUCCESS]', message.join(' '));
  }

  /**
   *
   * @param message
   */
  static secondary(...message: any) {
    console.log(new Date(), message.join(' '));
  }

  /**
   *
   * @param message
   */
  static primary(...message: any) {
    console.log(new Date(), message.join(' '));
  }

  /**
   *
   * @param message
   */
  static debug(...message: any[]) {
    const trace = get();
    console.log(new Date(), '[DEBUG]', `${trace[ 1 ].getFileName()}@${trace[ 1 ].getFunctionName()}:${trace[ 1 ].getLineNumber()}`);
    console.log(new Date(), '       ', Logger.stringify(message).join(' '));
  }
}
