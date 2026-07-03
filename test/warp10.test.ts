import {describe, it, mock} from 'node:test';
import assert from 'node:assert';
import {Warp10} from '../src/lib/warp10';

describe('Warp10', () => {
  it('constructs GTS input format', async () => {
    const warp10 = new Warp10({url: 'https://warp.example.com', writeToken: 'test-token'});
    const fetched: {url?: string; init?: RequestInit}[] = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (url: any, init?: any) => {
      fetched.push({url, init});
      return Promise.resolve(new Response());
    };

    warp10.pushData({
      h: '50', bat: '85', baro: '1013', tof: '30',
      templ: '20', temph: '35',
      pitch: '0', roll: '1', yaw: '45',
      agx: '0', agy: '0', agz: '1000',
      vgx: '0', vgy: '0', vgz: '0',
      mid: '123', mpry: '1,2,3'
    });

    globalThis.fetch = originalFetch;

    assert.equal(fetched.length, 1);
    assert.ok(fetched[0].url?.startsWith('https://warp.example.com/update'));
    assert.equal(fetched[0].init?.method, 'POST');
    assert.equal(fetched[0].init?.headers!['X-Warp10-Token'], 'test-token');

    const body = fetched[0].init?.body as string;
    // Should contain telemetry fields
    assert.ok(body.includes('ryze.tello.h'));
    assert.ok(body.includes('ryze.tello.bat'));
    // Should exclude mid and mpry
    assert.ok(!body.includes('ryze.tello.mid'));
    assert.ok(!body.includes('ryze.tello.mpry'));
    // Should have unit metadata
    assert.ok(body.includes('unit='));
  });
});
