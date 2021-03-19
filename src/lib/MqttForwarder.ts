import {connect, MqttClient} from "mqtt";
import {OSDData} from "../model/osdData";
import * as dayjs from "dayjs";

export class MqttForwarder {
  params: { url: string, clientId: string };
  client: MqttClient;
  private connected = false;

  constructor(params: { url: string, clientId: string }) {
    this.params = params;
    this.client = connect(params.url, {'clientId': params.clientId});
    this.client.on('connect', () => this.connected = true);
  }

  pushData(osdData: OSDData) {
    if (this.connected) {
      const dataFrame = {timestamp: dayjs().utc().valueOf() * 1000};
      Object.keys(osdData).forEach(k => {
        if (k && k !== 'mpry' && k !== 'mid') dataFrame[k] = osdData[k];
      });
      this.client.publish('ryze.tello', JSON.stringify(dataFrame));
    }
  }
}
