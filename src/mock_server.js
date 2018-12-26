'use strict';
const dgram = require('dgram');
const PORT2 = 8889;
const HOST2 = '0.0.0.0';
const server = dgram.createSocket('udp4');
const client = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
    const r = msg.toString().trim();
     console.log('Received', r);
        setTimeout(() =>{
            console.log('respond ok');
                client.send('ok', rinfo.port, rinfo.address)
        }, 2000);
});

server.on('listening', () => {
    const address = server.address();
    console.log('server listening', address.address, address.port);
});
server.bind(PORT2, HOST2);