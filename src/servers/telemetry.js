const http = require('http');


class TelloTelemetry {
    wsClients = [];
    webSocketsServerPort = 1338;

    start() {
        return new Promise(resolve => {
            this.httpServer = http.createServer(() => {
            });
            this.httpServer.listen(this.webSocketsServerPort, () => {
                console.log(new Date(), '[TelloTelemetry - WS]', 'Server is listening on port', this.webSocketsServerPort);
                resolve(this);
            });
            this.wsServer = new WebSocketServer({
                httpServer: this.httpServer
            });
            // WebSocket server
            this.wsServer.on('request', request => {
                const connection = request.accept(null, request.origin);
                console.log(new Date(), '[TelloTelemetry - WS]', 'Connection from origin', request.origin);
                const index = this.wsClients.push(connection) - 1;
                console.log(new Date(), '[TelloTelemetry - WS]', 'Connection accepted.');
                connection.on('close', connection => {
                    console.log(new Date(), '[TelloTelemetry - WS]', 'Peer', connection.remoteAddress, 'disconnected');
                    this.wsClients.splice(index, 1);
                });
            });
        });
    }

    send(data) {
        this.wsClients.forEach(c => c.sendUTF(JSON.stringify(data)));
    }

    stop() {
        this.httpServer.close(() => {
            console.log(new Date(), '[TelloTelemetry - WS]', 'Web Server stopped');
        })
    }
}

module.exports = new TelloTelemetry();