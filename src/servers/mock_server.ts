import {TelloWebServer} from './webServer';
import open from 'open';
import {Logger} from '../lib/logger';
import {createServer} from 'http';
import {createSocket} from 'dgram';
import {server, connection} from 'websocket';
import {AddressInfo} from 'net';

const PORT = 8889;
const HOST = '0.0.0.0';
const WS_PORT = 1337;

const udpServer = createSocket('udp4');
const udpClient = createSocket('udp4');
const wsClients: connection[] = [];
const telloWebServer = new TelloWebServer();

telloWebServer.start().catch(err => Logger.error('[Mock Server]', 'Failed to start web server', err));

const httpServer = createServer(() => {});

httpServer.listen(WS_PORT, () => {
  Logger.info('[Mock Server - WS]', 'Server is listening on port', WS_PORT);
  open('http://127.0.0.1:3000/mockServer.html');
});

const wsServer = new server({httpServer});

wsServer.on('request', req => {
  const cnx = req.accept(null, req.origin);
  Logger.info('[Mock Server - WS]', 'Connection from', req.origin);
  const index = wsClients.push(cnx) - 1;
  cnx.on('close', () => {
    Logger.info('[Mock Server - WS]', 'Peer', cnx.remoteAddress, 'disconnected');
    wsClients.splice(index, 1);
  });
});

udpServer.on('message', (msg, rinfo) => {
  const cmd = msg.toString().trim();
  Logger.info('[Mock Server - UDP]', 'Received', cmd);
  wsClients.forEach(c => c.sendUTF(JSON.stringify({type: 'request', message: cmd})));
  setTimeout(() => {
    Logger.info('[Mock Server - UDP]', 'respond ok');
    wsClients.forEach(c => c.sendUTF(JSON.stringify({type: 'response', message: 'ok'})));
    udpClient.send('ok', rinfo.port, rinfo.address);
  }, 2000);
});

udpServer.on('listening', () => {
  const address = udpServer.address() as AddressInfo;
  Logger.info('[Mock Server - UDP]', 'Server listening', address.address, address.port);
});

udpServer.bind(PORT, HOST);

process.on('SIGINT', () => {
  httpServer.close(() => {
    Logger.info('[Mock Server - WS]', 'Server stopped');
    udpServer.close(() => {
      telloWebServer.stop().then(() => Logger.info('[Mock Server - UDP]', 'Server stopped'));
    });
  });
});