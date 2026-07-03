import {createServer, Server} from 'http';
import {Logger} from '../lib/logger';
import {server, request, connection} from 'websocket';
import {OSDData} from '../model/osdData';
import {Warp10} from '../lib/warp10';
import {Options} from '../model/options';
import {MqttForwarder} from '../lib/MqttForwarder';

/** WebSocket server that broadcasts OSD telemetry to browser clients. Optionally forwards to Warp 10 and/or MQTT. */
export class TelloTelemetry {
  private wsClients: connection[] = [];
  private readonly port = 1338;
  private lastSend = 0;
  private httpServer?: Server;
  private wsServer?: server;
  private warp10?: Warp10;
  private mqttForwarder?: MqttForwarder;
  private options!: Options;

  /** Start the WebSocket server on port 1338. Initialises Warp 10 and MQTT forwarders if configured in options. */
  start(options: Options): Promise<TelloTelemetry> {
    this.options = options;
    if (options.withWarp10 && options.warp10Params) {
      this.warp10 = new Warp10(options.warp10Params);
    }
    if (options.withMqtt && options.mqttParams) {
      this.mqttForwarder = new MqttForwarder(options.mqttParams);
    }
    return new Promise<TelloTelemetry>(resolve => {
      this.lastSend = Date.now();
      this.httpServer = createServer(() => {});
      this.httpServer.listen(this.port, () => {
        Logger.info('[TelloTelemetry - WS]', 'Server is listening on port', this.port);
        resolve(this);
      });
      this.wsServer = new server({httpServer: this.httpServer});
      this.wsServer.on('request', (req: request) => {
        const cnx = req.accept(null, req.origin);
        Logger.info('[TelloTelemetry - WS]', 'Connection from', req.origin);
        const index = this.wsClients.push(cnx) - 1;
        cnx.on('close', () => {
          Logger.info('[TelloTelemetry - WS]', 'Peer', cnx.remoteAddress, 'disconnected');
          this.wsClients.splice(index, 1);
        });
      });
    });
  }

  /** Broadcast a telemetry frame to all connected WebSocket clients (throttled to 500ms). */
  send(data: OSDData) {
    if (Date.now() - this.lastSend >= 500) {
      this.warp10?.pushData(data);
      this.mqttForwarder?.pushData(data);
      this.wsClients.forEach(c => c.sendUTF(JSON.stringify(data)));
      this.lastSend = Date.now();
    }
  }

  /** Broadcast a raw video chunk to all connected clients. */
  sendVideo(chunk: Buffer) {
    this.wsClients.forEach(c => c.sendBytes(chunk));
  }

  /** Stop the HTTP and WebSocket server. */
  stop(): Promise<TelloTelemetry> {
    return new Promise<TelloTelemetry>(resolve => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          Logger.info('[TelloTelemetry - WS]', 'Web Server stopped');
          resolve(this);
        });
      } else {
        resolve(this);
      }
    });
  }
}