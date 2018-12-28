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
     * @return {Tello}
     */
    mock() {
        this.deviceIP = '127.0.0.1';
        return this;
    }

    /**
     *
     * @param value
     * @return {Promise<{tello: Tello, value: *}>}
     */
    get(value) {
        return Promise.resolve({value: this.osdData[value], tello: this});
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
     * @return {Promise<Tello>}
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
     * @return {Promise<Tello>}
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
     * @return {Promise<Tello>}
     */
    async emergencyStop() {
        return this.sendCmd('emergency');
    }

    /**
     *
     * @return {Promise<Tello>}
     */
    async takeoff() {
        await this.sendCmd('command');
        await this.sendCmd('takeoff');
        return this;
    }

    /**
     *
     * @param x1 in cm
     * @param y1 in cm
     * @param z1 in cm
     * @param x2 in cm
     * @param y2 in cm
     * @param z2 in cm
     * @param speed in cm/s
     * @return {Promise<Tello>}
     */
    curve(x1 = 20, y1 = 20, z1 = 20, x2 = 60, y2 = 40, z2 = 0, speed = 60) {
        return this.sendCmd('curve ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + x2 + ' ' + y2 + ' ' + z2 + ' ' + speed + ' ');

    }

    /**
     *
     * @param distance in cm
     * @return {Promise<Tello>}
     */
    forward(distance = 50) {
        return this.sendCmd('forward ' + distance);
    }

    /**
     *
     * @return {Promise<Tello>}
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
     * @param distance in cm
     * @return {Promise<Tello>}
     */
    right(distance = 50) {
        return this.sendCmd('right ' + distance);
    }

    /**
     *
     * @param height in cm
     * @return {Promise<Tello>}
     */
    down(height = 50) {
        return this.sendCmd('down ' + height);
    }

    /**
     *
     * @param speed in cm/s
     * @return {Promise<Tello>}
     */
    speed(speed = 50) {
        return this.sendCmd('speed ' + speed);
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
     * @param distance in cm
     * @return {Promise<Tello>}
     */
    left(distance = 50) {
        return this.sendCmd('left ' + distance);
    }

    /**
     *
     * @param angle in degree
     * @return {Promise<Tello>}
     */
    rotateCW(angle = 90) {
        return this.sendCmd('cw ' + angle);
    }

    /**
     *
     * @return {Promise<Tello>}
     */
    land() {
        return this.sendCmd('land');
    }

    /**
     *
     * @param distance in cm
     * @return {Promise<Tello>}
     */
    backward(distance = 50) {
        return this.sendCmd('back ' + distance);
    }

    /**
     *
     * @param angle in degree
     * @return {Promise<Tello>}
     */
    rotateCCW(angle = 90) {
        return this.sendCmd('ccw ' + angle);
    }

    /**
     *
     * @param height in cm
     * @return {Promise<Tello>}
     */
    up(height = 50) {
        return this.sendCmd('up ' + height);
    }

    /**
     *
     * @param orientation: f, b, l, r
     * @return {Promise<Tello>}
     */
    flip(orientation = 'f') {
        return this.sendCmd('flip ' + orientation);
    }

    /**
     *
     * @param x in cm
     * @param y in cm
     * @param z in cm
     * @param speed in cm/s
     * @return {Promise<Tello>}
     */
    flyTo(x = 50, y = 50, z = 0, speed = 100) {
        return this.sendCmd('go ' + x + ' ' + y + ' ' + z + ' ' + speed + ' ');
    }
}

module.exports = new Tello();