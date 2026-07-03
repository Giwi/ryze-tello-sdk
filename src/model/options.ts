export interface Options {
  withWarp10?: boolean;
  warp10Params?: { url: string; writeToken: string };
  withMqtt?: boolean;
  mqttParams?: { url: string; clientId: string };
}