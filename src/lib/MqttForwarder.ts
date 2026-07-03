import {Logger} from './logger';
import {OSDData} from '../model/osdData';

/** Forwards OSD telemetry data to an MQTT broker.
 * Requires the optional `mqtt` package — install with `npm install mqtt`.
 */
export class MqttForwarder {
  private client: any;
  private connected = false;

  /** @param params - MQTT broker URL and clientId. */
  constructor(params: { url: string; clientId: string }) {
    this.init(params);
  }

  private async init(params: { url: string; clientId: string }) {
    try {
      const mqtt = await import('mqtt');
      this.client = mqtt.connect(params.url, {clientId: params.clientId});
      this.client.on('connect', () => this.connected = true);
      this.client.on('error', (err: Error) => Logger.error('[MQTT]', err.message));
    } catch {
      Logger.warning('[MQTT]', 'mqtt package not available, install with: npm install mqtt');
    }
  }

  /** Publish a telemetry frame to the `ryze.tello` topic. Skips `mpry` and `mid` fields. */
  pushData(osdData: OSDData) {
    if (!this.client || !this.connected) return;
    const dataFrame: Record<string, number | string> = {timestamp: Date.now() * 1000};
    Object.keys(osdData).forEach(k => {
      if (k !== 'mpry' && k !== 'mid') dataFrame[k] = osdData[k];
    });
    this.client.publish('ryze.tello', JSON.stringify(dataFrame));
  }
}