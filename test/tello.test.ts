import {describe, it} from 'node:test';
import assert from 'node:assert';
import {Tello} from '../src/lib/tello';

describe('Tello', () => {
  it('mock() returns self', () => {
    const tello = new Tello();
    assert.equal(tello.mock(), tello);
  });

  it('wait() resolves with self', async () => {
    const tello = new Tello();
    const result = await tello.wait(1);
    assert.equal(result, tello);
  });

  it('get() returns field value from OSD data', async () => {
    const tello = new Tello();
    (tello as any).osdData = {bat: '75', h: '42'};
    const r = await tello.get('bat');
    assert.equal(r.value, '75');
  });

  it('has all command methods', () => {
    const tello = new Tello();
    const methods = ['forward', 'backward', 'up', 'down', 'left', 'right',
      'takeoff', 'land', 'emergencyStop', 'rotateCW', 'rotateCCW',
      'flip', 'speed', 'curve', 'flyTo', 'wait', 'get', 'start', 'stop',
      'mock', 'startStream', 'stopStream', 'startTelemetry', 'stopTelemetry'];
    for (const m of methods) {
      assert.equal(typeof (tello as any)[m], 'function', `Tello.${m} should be a function`);
    }
  });
});
