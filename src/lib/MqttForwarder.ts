import {connect, MqttClient} from 'mqtt';
import {OSDData} from '../model/osdData';

export class MqttForwarder {
  private client: MqttClient;
  private connected = false;

  constructor(params: { url: string; clientId: string }) {
    this.client = connect(params.url, {clientId: params.clientId});
    this.client.on('connect', () => this.connected = true);
  }

  pushData(osdData: OSDData) {
    if (!this.connected) return;
    const dataFrame: Record<string, number | string> = {timestamp: Date.now() * 1000};
    Object.keys(osdData).forEach(k => {
      if (k !== 'mpry' && k !== 'mid') dataFrame[k] = osdData[k];
    });
    this.client.publish('ryze.tello', JSON.stringify(dataFrame));
  }
}