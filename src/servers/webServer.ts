import * as path from 'path';
import * as fs from 'fs';
import { createServer, Server } from 'http';
import { Logger } from '../lib/logger';

/**
 *
 */
export class TelloWebServer {
    private httpServer: Server;
    /**
     *
     * @return {Promise}
     */
    start() {
        return new Promise(resolve => {
            this.httpServer = createServer(function (request, response) {

                const filePath = __dirname + '/../www' + request.url;
                const extname = path.extname(filePath);
                Logger.info('[Web Server]', 'serving', filePath);
                let contentType = 'text/html';
                switch (extname) {
                    case '.js':
                        contentType = 'text/javascript';
                        break;
                    case '.css':
                        contentType = 'text/css';
                        break;
                    case '.json':
                        contentType = 'application/json';
                        break;
                    case '.png':
                        contentType = 'image/png';
                        break;
                    case '.jpg':
                        contentType = 'image/jpg';
                        break;
                    case '.wav':
                        contentType = 'audio/wav';
                        break;
                }
                fs.readFile(filePath, function (error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end(`Sorry, check with the site admin for error: ${error.code} ..
`);
                        response.end();
                    } else {
                        response.writeHead(200, {'Content-Type': contentType});
                        response.end(content, 'utf-8');
                    }
                });
            }).listen(3000, () => {
                Logger.info('[Web Server]', 'Server is listening on port', 3000);
                resolve();
            });
        });
    }

    /**
     *
     * @return {Promise}
     */
    stop() {
        return new Promise(resolve => {
            if (this.httpServer) {
                this.httpServer.close(() => {
                    Logger.info('[Web Server]', 'Web Server stopped');
                    resolve();
                })
            } else {
                resolve();
            }
        });
    }
}
