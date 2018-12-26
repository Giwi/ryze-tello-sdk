'use strict';
const dgram = require('dgram');
const EventEmitter = require('events');
const PORT = 8889;
const HOST = '192.168.10.1';
const PORT2 = 8890;
const HOST2 = '0.0.0.0';
const localPort = 50602;

/**
 *
 */
class Tello {
    /**
     *
     */
    constructor() {
        this.myEmitter = new EventEmitter();
        this.osdData = {};
        this.deviceIP = HOST;
        this.client = undefined;
        this.server = undefined;
    }

    /**
     *
     */
    mock() {
        this.deviceIP = '127.0.0.1';
    }

    /**
     *
     */
    listenState() {
        this.server.on('message', msg => {
            msg = msg.toString().trim();
            const fieldList = msg.split(';');
            fieldList.forEach(field => {
                const fields = field.split(':');
                this.osdData[fields[0]] = fields[1];
            });
            /*     console.log('fieldList', fieldList)
                 console.log('osdData', osdData)*/
        });

        this.server.on('listening', () => {
            const address = this.server.address();
            console.log('server listening', address.address, address.port);
        });
        this.server.bind(PORT2, HOST2);
    }

    /**
     *
     * @param cmd
     * @return {Promise<any>}
     */
    sendMethod(cmd) {
        return new Promise(((resolve, reject) => {
            const message = new Buffer(cmd);
            console.log('send:', cmd);
            this.client.send(message, 0, message.length, PORT, this.deviceIP, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve()
                }
            });
        }));
    }

    /**
     *
     * @param cmd
     * @return {Promise<any>}
     */
    sendCmd(cmd) {
        return new Promise(((resolve, reject) => {
            this.sendMethod(cmd).then(() => {
                this.myEmitter.on('status', () => {
                    resolve(this);
                });
            }).catch(err => {
                reject(err);
            });
        }));
    }

    /**
     *
     * @return {Promise<any>}
     */
    emergencyStop() {
        return this.sendCmd('emergency');
    }

    /**
     *
     * @return {Promise<any>}
     */
    takeoff() {
        return new Promise(resolve => {
            this.sendCmd('command')
                .then(() => this.sendCmd('takeoff')
                    .then(() => {
                        resolve(this);
                    })
                )
        });
    }

    /**
     *
     * @param x1
     * @param y1
     * @param z1
     * @param x2
     * @param y2
     * @param z2
     * @param speed
     * @return {Promise<any>}
     */
    curve(x1 = 20, y1 = 20, z1 = 20, x2 = 60, y2 = 40, z2 = 0, speed = 60) {
        return this.sendCmd('curve ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + x2 + ' ' + y2 + ' ' + z2 + ' ' + speed + ' ');
    }

    /**
     *
     * @param distance
     * @return {Promise<any>}
     */
    forward(distance = 50) {
        return this.sendCmd('forward ' + distance);
    }

    /**
     *
     * @return {Promise<any>}
     */
    start() {
        return new Promise(resolve => {
            this.client = dgram.createSocket('udp4');
            this.server = dgram.createSocket('udp4');
            this.client.bind(localPort, '0.0.0.0', () => {
                console.log('connected');
                resolve(this);
            });
            process.on('SIGINT', () => {
                this.stop();
            });
            this.client.on('message', msg => {
                if (msg.toString() === 'ok') {
                    console.log('Data received from server : ' + msg.toString());
                } else {
                    console.error('not ok', msg);
                }
                this.myEmitter.emit('status');
            });
            this.listenState();
        });
    }

    /**
     *
     * @param distance
     * @return {Promise<any>}
     */
    right(distance = 50) {
        return this.sendCmd('right ' + distance);
    }

    /**
     *
     * @param height
     * @return {Promise<any>}
     */
    down(height = 50) {
        return this.sendCmd('down ' + height);
    }

    /**
     *
     * @param speed
     * @return {Promise<any>}
     */
    speed(speed = 50) {
        return this.sendCmd('speed ' + speed);
    }

    /**
     *
     * @return {Promise<any>}
     */
    getHeight() {
        return this.sendCmd('h');
    }

    /**
     *
     */
    stop() {
        this.client.close();
        this.server.close();
        console.log('Goodbye !');
        process.exit();
    }

    /**
     *
     * @param distance
     * @return {Promise<any>}
     */
    left(distance = 50) {
        return this.sendCmd('left ' + distance);
    }

    /**
     *
     * @param angle
     * @return {Promise<any>}
     */
    rotateCW(angle = 90) {
        return this.sendCmd('cw ' + angle);
    }

    /**
     *
     * @return {Promise<any>}
     */
    land() {
        return this.sendCmd('land');
    }

    /**
     *
     * @param distance
     * @return {Promise<any>}
     */
    backward(distance = 50) {
        return this.sendCmd('back ' + distance);
    }

    /**
     *
     * @param angle
     * @return {Promise<any>}
     */
    rotateCCW(angle = 90) {
        return this.sendCmd('ccw ' + angle);
    }

    /**
     *
     * @param height
     * @return {Promise<any>}
     */
    up(height = 50) {
        return this.sendCmd('up ' + height);
    }

    /**
     *
     * @param orientation
     * @return {Promise<any>}
     */
    flip(orientation = 'f') {
        return this.sendCmd('flip ' + orientation);
    }

    /**
     *
     * @param x
     * @param y
     * @param z
     * @param speed
     * @return {Promise<any>}
     */
    flyTo(x = 50, y = 50, z = 0, speed = 100) {
        return this.sendCmd('go ' + x + ' ' + y + ' ' + z + ' ' + speed + ' ');
    }
}

module.exports = new Tello();