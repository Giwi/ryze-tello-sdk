import {describe, it} from 'node:test';
import assert from 'node:assert';
import {Logger} from '../src/lib/logger';

describe('Logger', () => {
  it('info writes to stdout', () => {
    const logs: string[] = [];
    const spy = console.log;
    console.log = (...args: string[]) => logs.push(args.join(' '));
    Logger.info('hello', 'world');
    console.log = spy;
    assert.ok(logs[0].includes('[INFO]'));
    assert.ok(logs[0].includes('hello world'));
  });

  it('error writes to stderr', () => {
    const logs: string[] = [];
    const spy = console.error;
    console.error = (...args: string[]) => logs.push(args.join(' '));
    Logger.error('test error');
    console.error = spy;
    assert.ok(logs[0].includes('[ERROR]'));
    assert.ok(logs[0].includes('test error'));
  });

  it('warning writes to stderr', () => {
    const logs: string[] = [];
    const spy = console.warn;
    console.warn = (...args: string[]) => logs.push(args.join(' '));
    Logger.warning('test warning');
    console.warn = spy;
    assert.ok(logs[0].includes('[WARNING]'));
  });
});
