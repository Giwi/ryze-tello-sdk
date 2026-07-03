/** Configuration options for telemetry forwarders. */
export interface Options {
  /** Enable Warp 10 telemetry forwarding. Requires `warp10Params`. */
  withWarp10?: boolean;
  /** Warp 10 endpoint URL and write token. */
  warp10Params?: { url: string; writeToken: string };
  /** Enable MQTT telemetry forwarding. Requires `mqttParams`. */
  withMqtt?: boolean;
  /** MQTT broker URL and client ID. */
  mqttParams?: { url: string; clientId: string };
}