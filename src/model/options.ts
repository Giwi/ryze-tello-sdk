export class Options {
  withWarp10? = false;
  warp10Params?: { url: string; writeToken: string };
  withMqtt? = false;
  mqttParams?: { url: string, clientId: string };
}
