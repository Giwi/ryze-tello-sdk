import {connect, MqttClient} from 'mqtt';
import {OSDData} from '../model/osdData';

/** Forwards OSD telemetry data to an MQTT broker. */
export class MqttForwarder {
  private client: MqttClient;
  private connected = false;

  /** @param params - MQTT broker URL and clientId. */
  constructor(params: { url: string; clientId: string }) {
    this.client = connect(params.url, {clientId: params.clientId});
    this.client.on('connect', () => this.connected = true);
  }

  /** Publish a telemetry frame to the `ryze.tello` topic. Skips `mpry` and `mid` fields. */
  pushData(osdData: OSDData) {
    if (!this.connected) return;
    const dataFrame: Record<string, number | string> = {timestamp: Date.now() * 1000};
    Object.keys(osdData).forEach(k => {
      if (k !== 'mpry' && k !== 'mid') dataFrame[k] = osdData[k];
    });
    this.client.publish('ryze.tello', JSON.stringify(dataFrame));
  }
}