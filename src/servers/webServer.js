const http = require('http');
const fs = require('fs');
const path = require('path');

class TelloWebServer {
    start() {
        this.httpServer = http.createServer(function (request, response) {
            const filePath = __dirname + '/../www/' + request.url;
            const extname = path.extname(filePath);
            console.log(new Date(), '[Web Server]', 'serving', filePath);
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
                    response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                    response.end();
                } else {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(content, 'utf-8');
                }
            });
        }).listen(3000, () => {
            console.log(new Date(), '[Web Server]', 'Server is listening on port', 3000);
        });
    }

    stop() {
        this.httpServer.close(() => {
            console.log(new Date(), '[Web Server]', 'Web Server stopped');
        })
    }
}

module.exports = new TelloWebServer();