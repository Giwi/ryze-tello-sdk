import { TelloWebServer } from './webServer';
import opn = require('open');
import { Logger } from '../lib/logger';
import { createServer } from 'http';
import { createSocket } from 'dgram';
import { server } from 'websocket';
import { AddressInfo } from 'net';

const PORT2 = 8889;
const HOST2 = '0.0.0.0';
const UDPServer = createSocket('udp4');
const UDPClient = createSocket('udp4');

const wsClients = [];
const webSocketsServerPort = 1337;

const telloWebServer = new TelloWebServer();
telloWebServer.start().then(() => {});

const httpServer = createServer(() => {
});

httpServer.listen(webSocketsServerPort, function() {
  Logger.info('[Mock Server - WS]', 'Server is listening on port', webSocketsServerPort);
  opn('http://127.0.0.1:3000/mockServer.html').then(() => {
  });
});


// create the server
const wsServer = new server({
  httpServer: httpServer
});

// WebSocket server
wsServer.on('request', request => {
  const connection = request.accept(null, request.origin);
  Logger.info('[Mock Server - WS]', 'Connection from origin', request.origin);
  const index = wsClients.push(connection) - 1;
  Logger.info('[Mock Server - WS]', 'Connection accepted.');
  connection.on('close', () => {
    Logger.info('[Mock Server - WS]', 'Peer', request.remoteAddress, 'disconnected');
    wsClients.splice(index, 1);
  });
});


UDPServer.on('message', (msg, rinfo) => {
  const r = msg.toString().trim();
  Logger.info('[Mock Server - UDP]', 'Received', r);
  wsClients.forEach(c => c.sendUTF(JSON.stringify({ type: 'request', message: r })));
  setTimeout(() => {
    Logger.info('[Mock Server - UDP]', 'respond ok');
    wsClients.forEach(c => c.sendUTF(JSON.stringify({ type: 'response', message: 'ok' })));
    UDPClient.send('ok', rinfo.port, rinfo.address)
  }, 2000);
});

UDPServer.on('listening', () => {
  const address = UDPServer.address() as AddressInfo;
  Logger.info('[Mock Server - UDP]', 'Server listening', address.address, address.port);
});
UDPServer.bind(PORT2, HOST2);

process.on('SIGINT', () => {
  httpServer.close(() => {
    Logger.info('[Mock Server - WS]', 'Server stopped');
    UDPServer.close(() => {
      telloWebServer.stop().then(() => Logger.info('[Mock Server - UDP]', 'Server stopped'));
    });
  });
});
