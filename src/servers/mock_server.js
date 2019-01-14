'use strict';
const WebSocketServer = require('websocket').server;
const http = require('http');
const opn = require('opn');
const dgram = require('dgram');
const TelloWebServer = require('./webServer');
const PORT2 = 8889;
const HOST2 = '0.0.0.0';
const server = dgram.createSocket('udp4');
const client = dgram.createSocket('udp4');

const wsClients = [];
const webSocketsServerPort = 1337;

TelloWebServer.start();

const httpServer = http.createServer(() => {
});
httpServer.listen(webSocketsServerPort, function () {
    console.log(new Date(), '[Mock Server - WS]', 'Server is listening on port', webSocketsServerPort);
    opn('http://127.0.0.1:3000/mockServer.html')
});


// create the server
const wsServer = new WebSocketServer({
    httpServer: httpServer
});


// WebSocket server
wsServer.on('request', function (request) {
    const connection = request.accept(null, request.origin);
    console.log(new Date(), '[Mock Server - WS]', 'Connection from origin', request.origin);
    const index = wsClients.push(connection) - 1;
    console.log(new Date(), '[Mock Server - WS]', 'Connection accepted.');
    connection.on('close', function (connection) {
        console.log(new Date(), '[Mock Server - WS]', 'Peer', connection.remoteAddress, 'disconnected');
        wsClients.splice(index, 1);
    });
});


server.on('message', (msg, rinfo) => {
    const r = msg.toString().trim();
    console.log(new Date(), '[Mock Server - UDP]', 'Received', r);
    wsClients.forEach(c => c.sendUTF(r));
    setTimeout(() => {
        console.log(new Date(), '[Mock Server - UDP]', 'respond ok');
        wsClients.forEach(c => c.sendUTF('ok'));
        client.send('ok', rinfo.port, rinfo.address)
    }, 2000);
});

server.on('listening', () => {
    const address = server.address();
    console.log(new Date(), '[Mock Server - UDP]', 'Server listening', address.address, address.port);
});
server.bind(PORT2, HOST2);

process.on('SIGINT', () => {
    httpServer.close(() => {
        console.log(new Date(), '[Mock Server - WS]', 'Server stopped');
        server.close(() => {
            TelloWebServer.stop();
            console.log(new Date(), '[Mock Server - UDP]', 'Server stopped');
        });
    });
});