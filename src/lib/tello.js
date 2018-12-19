const dgram = require('dgram');
const http = require('http');
const fs = require('fs');
const url = require('url');

function Tello() {
    const localPort = 50602;
    const blockCmd = ['emergency', 'rc'];
    const notBlockCmd = [];
    const PORT = 8889;
    const HOST = '192.168.10.1';
    const PORT2 = 8890;
    const HOST2 = '0.0.0.0';
    let order = [];
    const osdData = {};
    let lock = false;
    let client;
    let server;

    function listenState() {
        server.on('message', function (msg, rinfo) {
            msg = msg.toString().trim();
            // console.log('Received 8890', msg)
            const fieldList = msg.split(';');
            fieldList.forEach(function (field) {
                const fields = field.split(':');
                osdData[fields[0]] = fields[1];
            })
            console.log('fieldList', fieldList)
            console.log('osdData', osdData)
        });

        server.on('listening', function () {
            var address = server.address();
            console.log('server listening', address.address, address.port);
        });

        server.bind(PORT2, HOST2);
    }

    function sendMethod(cmd) {
        const message = new Buffer(cmd);
        console.log('send:', cmd);
        /* client.send(message, 0, message.length, PORT, HOST, function (err, bytes) {
             if (err) {
                 console.log('Error', err);
                 throw err;
             }
         });*/
    }

    function sendCmd(cmd) {
        if (notBlockCmd.indexOf(cmd) >= 0) {
            return
        }
        if (blockCmd.indexOf(cmd) >= 0) {
            sendMethod(cmd);
            order = [];
            return false;
        }
        order.push(cmd);
        !lock && carryCMD();
    }

    function carryCMD() {
        lock = true;
        if (order.length) {
            sendMethod(order[0])
        } else {
            lock = false
        }
    }

    /**
     *
     * @return {Tello}
     */
    this.start = function () {
        client = dgram.createSocket('udp4');
        server = dgram.createSocket('udp4');
        client.bind(localPort);
        process.on('SIGINT', function () {
            stop();
        });
        listenState();

        client.on('message', function (msg, info) {
            if (msg.toString() === 'ok') {
                console.log('Data received from server : ' + msg.toString());
                console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port);
                if (order.length) {
                    order = order.splice(1)
                }
                carryCMD();
            } else {
                console.log('not ok', msg.toString());
                order = [];
                lock = false
            }
        });
        return this;
    };


    this.stop = function () {
        order = [];
        client.close();
        server.close();
        console.log('Goodbye !');
        process.exit();
    };

    /**
     *
     * @return {Tello}
     */
    this.takeoff = function () {
        sendCmd('command');
        sendCmd('takeoff');
        return this;
    };

    /**
     *
     * @return {Tello}
     */
    this.land = function () {
        sendCmd('land');
        return this;
    };

    /**
     *
     * @param height in cm
     * @return {Tello}
     */
    this.up = function (height = 50) {
        sendCmd('up ' + height);
        return this;
    };
    /**
     *
     * @param height in cm
     * @return {Tello}
     */
    this.down = function (height = 50) {
        sendCmd('down ' + height);
        return this;
    };
    /**
     *
     * @param distance in cm
     * @return {Tello}
     */
    this.left = function (distance = 50) {
        sendCmd('left ' + distance);
        return this;
    };
    /**
     *
     * @param distance in cm
     * @return {Tello}
     */
    this.right = function (distance = 50) {
        sendCmd('right ' + distance);
        return this;
    };

    /**
     *
     * @param distance in cm
     * @return {Tello}
     */
    this.forward = function (distance = 50) {
        sendCmd('forward ' + distance);
        return this;
    };
    /**
     *
     * @param distance in cm
     * @return {Tello}
     */
    this.backward = function (distance = 50) {
        sendCmd('forward ' + distance);
        return this;
    };
    /**
     *
     * @param angle in degree
     * @return {Tello}
     */
    this.rotateCW = function (angle = 90) {
        sendCmd('cw ' + angle);
        return this;
    };
    /**
     *
     * @param angle in degree
     * @return {Tello}
     */
    this.rotateCCW = function (angle = 90) {
        sendCmd('ccw ' + angle);
        return this;
    };

    /**
     *
     * @param orientation f, b, l, r
     * @return {Tello}
     */
    this.flip = function (orientation = 'f') {
        sendCmd('f ' + orientation);
        return this;
    };

    /**
     *
     * @param speed in cm/s
     * @return {Tello}
     */
    this.speed = function (speed = 50) {
        sendCmd('speed ' + speed);
        return this;
    };

    /**
     *
     * @param x in cm
     * @param y in cm
     * @param z in cm
     * @param speed in cm/s
     * @return {Tello}
     */
    this.flyTo = function (x = 50, y = 50, z = 0, speed = 100) {
        sendCmd('go ' + x + ' ' + y + ' ' + z + ' ' + speed + ' ');
        return this;
    };

    /**
     *
     * @param x1 in cm
     * @param y1 in cm
     * @param z1 in cm
     * @param x2 in cm
     * @param y2 in cm
     * @param z2 in cm
     * @param speed in cm/s
     * @return {Tello}
     */
    this.curve = function (x1 = 20, y1 = 20, z1 = 20, x2 = 60, y2 = 40, z2 = 0, speed = 60) {
        sendCmd('curve ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + x2 + ' ' + y2 + ' ' + z2 + ' ' + speed + ' ');
        return this;
    };

    /**
     *
     * @return {Tello}
     */
    this.emergencyStop = function () {
        sendCmd('emergency');
        return this;
    };

    this.getHeight = function () {
        return {
            h: sendCmd('h')
        }
    }
}

module.exports = new Tello();