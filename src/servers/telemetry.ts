import { createServer, Server } from "http";
import { Logger } from "../lib/logger";
import { request, server } from "websocket";
import { OSDData } from "../model/osdData";

/**
 *
 */
export class TelloTelemetry {

  private wsClients = [];
  private webSocketsServerPort = 1338;
  private timer: number;
  private httpServer: Server;
  private wsServer: server;

  /**
   *
   * @return {Promise<TelloTelemetry>}
   */
  start(): Promise<TelloTelemetry> {
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
        Logger.info('[TelloTelemetry - WS]', 'Connection from origin', request.origin);
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
    this.sendBatch(JSON.stringify(data));
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
   * @param {string} data
   */
  sendBatch(data: string) {
    if(new Date().getTime() - this.timer >= 500) {
      this.wsClients.forEach(c => c.sendUTF(data));
      this.timer = new Date().getTime();
    }
  }
}