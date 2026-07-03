import * as path from 'path';
import * as fs from 'fs';
import {createServer, Server, IncomingMessage, ServerResponse} from 'http';
import {Logger} from '../lib/logger';

const MIME_TYPES: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
};

export class TelloWebServer {
  private httpServer?: Server;
  private readonly port = 3000;

  start(): Promise<void> {
    return new Promise<void>(resolve => {
      this.httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
        const filePath = __dirname + '/../www' + req.url;
        const contentType = MIME_TYPES[path.extname(filePath)] || 'text/html';
        Logger.info('[Web Server]', 'serving', filePath);
        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end(`Error: ${err.code}`);
          } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf-8');
          }
        });
      }).listen(this.port, () => {
        Logger.info('[Web Server]', 'Server is listening on port', this.port);
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          Logger.info('[Web Server]', 'Web Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}