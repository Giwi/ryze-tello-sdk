import {createServer, Server} from 'http';
import {Logger} from '../lib/logger';
import {request, server} from 'websocket';
import {OSDData} from '../model/osdData';
import {Warp10} from '../lib/warp10';
import {Options} from "../model/options";
import {MqttForwarder} from "../lib/MqttForwarder";

/**
 *
 */
export class TelloTelemetry {
  private wsClients = [];
  private webSocketsServerPort = 1338;
  private timer: number;
  private httpServer: Server;
  private wsServer: server;
  private warp10: Warp10;
  private mqttForwarder: MqttForwarder;
  private options: Options;
  /**
   *
   * @param options
   */
  start(options: Options): Promise<TelloTelemetry> {
    this.options = options;
    if (this.options.withWarp10) {
      this.warp10 = new Warp10(this.options.warp10Params);
    }
    if (this.options.withMqtt) {
      this.mqttForwarder = new MqttForwarder(this.options.mqttParams);
    }
    return new Promise<TelloTelemetry>(resolve => {
      this.timer = new Date().getTime();
      this.httpServer = createServer(() => {
      });
      this.httpServer.listen(this.webSocketsServerPort, () => {
        Logger.info('[TelloTelemetry - WS]', 'Server is listening on port', this.webSocketsServerPort);
        resolve(this);
      });
      this.wsServer = new server({
        httpServer: this.httpServer
      });
      // WebSocket server
      this.wsServer.on('request', (request: request) => {
        const cnx = request.accept(null, request.origin);
        Logger.info('[TelloTelemetry - WS]', 'Connection from origin', request.origin
        );
        const index = this.wsClients.push(cnx) - 1;
        Logger.info('[TelloTelemetry - WS]', 'Connection accepted.');
        cnx.on('close', () => {
          Logger.info('[TelloTelemetry - WS]', 'Peer', cnx.remoteAddress, 'disconnected');
          this.wsClients.splice(index, 1);
        });
      });
    });
  }

  /**
   *
   * @param {OSDData} data
   */
  send(data: OSDData) {
    this.sendBatch(data);
  }

  /**
   *
   * @param chunk
   */
  sendVideo(chunk: any) {
    this.wsClients.forEach(c => c.send(chunk));
  }

  stop(): Promise<TelloTelemetry> {
    return new Promise<TelloTelemetry>(resolve => {
      this.httpServer.close(() => {
        Logger.info('[TelloTelemetry - WS]', 'Web Server stopped');
        resolve(this);
      });
    });
  }

  /**
   *
   * @param {OSDData} data
   */
  sendBatch(data: OSDData) {
    if (new Date().getTime() - this.timer >= 500) {
      if (this.options.withWarp10) {
        this.warp10.pushData(data);
      }
      if (this.options.withMqtt) {
        this.mqttForwarder.pushData(data);
      }
      this.wsClients.forEach(c => c.sendUTF(JSON.stringify(data)));
      this.timer = new Date().getTime();
    }
  }
}
