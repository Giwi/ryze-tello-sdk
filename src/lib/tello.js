'use strict';
const dgram = require('dgram');
const EventEmitter = require('events');
const opn = require('opn');
const {spawn} = require('child_process');
const TelloWebServer = require('../servers/webServer');
const TelloTelemetry = require('../servers/telemetry');

const PORT = 8889;
const HOST = '192.168.10.1';
const PORT2 = 8890;
const HOST2 = '0.0.0.0';
const localPort = 50602;

/**
 * @class Tello
 * @module Tello
 */
class Tello {
    isMock = false;
    hasTelemetry = false;
    myEmitter = new EventEmitter();
    osdData = {};
    deviceIP = HOST;
    client = undefined;
    server = undefined;
    h264encoder = undefined;


    /**
     *
     * @param {number} time in ms
     * @return {Promise<Tello>}
     */
    async wait(time) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this);
            }, time);
        });
    };


    /**
     *
     * @return {Promise<Tello>}
     */
    stopStream() {
        return new Promise(resolve => {
            this.sendCmd('streamoff').then(() => {
                if (this.tello_video) {
                    this.tello_video.close();
                    this.tello_video = undefined;
                }
                if (this.h264encoder) {
                    this.h264encoder.kill();
                }
                resolve(this)
            });
        });
    }

    /**
     *
     * @return {Promise<Tello>}
     */
    startStream() {
        return new Promise(resolve => {
            this.sendCmd('streamon').then(() => {
                this.tello_video = dgram.createSocket('udp4');
                this.h264encoder_spawn = {
                    "command": 'mplayer',
                    "args": ['-gui', '-nolirc', '-fps', '35', '-really-quiet', '-']
                };
                this.h264encoder = spawn(this.h264encoder_spawn.command, this.h264encoder_spawn.args);
                this.h264encoder.on('close', (code) => {
                    console.log(new Date(), '[Tello]', `child process exited with code ${code}`);
                });
                this.h264encoder.stderr.on('data', data => {
                    console.log(new Date(), '[Tello]', 'mplayer error', data.toString());
                });
                this.tello_video.on('message', msg => this.h264encoder.stdin.write(msg));
                this.tello_video.on('listening', () => {
                    console.log(new Date(), '[Tello]', `tello_video listening ${this.tello_video.address().address}:${this.tello_video.address().port}`);
                    resolve(this)
                });
                this.tello_video.bind(11111, HOST2);
            });
        });
    }

    /**
     *
     * @return {Tello}
     */
    mock() {
        this.deviceIP = '127.0.0.1';
        this.isMock = true;
        return this;
    }

    startTelemetry() {
        return new Promise(resolve => {
           if(!this.isMock) {
               TelloWebServer.start()
           }
           TelloTelemetry.start().then(() =>{
               this.hasTelemetry = true;
               opn('http://127.0.0.1:3000/telemetry.html')
           });
        });
    }

    /**
     *
     * @param {string} value
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
                if(this.hasTelemetry) {
                    TelloTelemetry.send(this.osdData);
                }
            });
            /*     console.log('fieldList', fieldList)
                 console.log('osdData', osdData)*/
        });

        this.server.on('listening', () => {
            const address = this.server.address();
            console.log(new Date(), '[Tello]', 'server listening', address.address, address.port);
        });
        this.server.bind(PORT2, HOST2);
    }

    /**
     *
     * @param {string} cmd
     * @return {Promise<Tello>}
     */
    sendMethod(cmd) {
        return new Promise(((resolve, reject) => {
            const message = new Buffer(cmd);
            console.log(new Date(), '[Tello]', 'send:', cmd);
            this.client.send(message, 0, message.length, PORT, this.deviceIP, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this)
                }
            });
        }));
    }

    /**
     *
     * @param {string} cmd
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
    takeoff() {
        return this.sendCmd('takeoff');
    }

    /**
     *
     * @param {number} x1 in cm
     * @param {number} y1 in cm
     * @param {number} z1 in cm
     * @param {number} x2 in cm
     * @param {number} y2 in cm
     * @param {number} z2 in cm
     * @param {number} speed in cm/s
     * @return {Promise<Tello>}
     */
    curve(x1 = 20, y1 = 20, z1 = 20, x2 = 60, y2 = 40, z2 = 0, speed = 60) {
        return this.sendCmd('curve ' + x1 + ' ' + y1 + ' ' + z1 + ' ' + x2 + ' ' + y2 + ' ' + z2 + ' ' + speed + ' ');

    }

    /**
     *
     * @param {number} distance in cm
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
                console.log(new Date(), '[Tello]', 'connected');
                this.sendCmd('command').then(() => {
                    resolve(this);
                });
            });
            process.on('SIGINT', () => {
                this.stop();
            });
            this.client.on('message', msg => {
                if (msg.toString() === 'ok') {
                    console.log(new Date(), '[Tello]', 'Data received from server : ' + msg.toString());
                } else {
                    console.error(new Date(), '[Tello]', 'not ok', msg);
                }
                this.myEmitter.emit('status');
            });
            this.listenState();
        });
    }

    /**
     *
     * @param {number} distance in cm
     * @return {Promise<Tello>}
     */
    right(distance = 50) {
        return this.sendCmd('right ' + distance);
    }

    /**
     *
     * @param {number} height in cm
     * @return {Promise<Tello>}
     */
    down(height = 50) {
        return this.sendCmd('down ' + height);
    }

    /**
     *
     * @param {number} speed in cm/s
     * @return {Promise<Tello>}
     */
    speed(speed = 50) {
        return this.sendCmd('speed ' + speed);
    }

    /**
     * Ends the process
     */
    stop() {
        this.client.close();
        this.server.close();
        if (this.tello_video) {
            this.tello_video.close();
        }
        if (this.h264encoder) {
            this.h264encoder.kill();
        }
        if(!this.isMock) {
            TelloWebServer.stop();
        }
        console.log(new Date(), '[Tello]', 'Goodbye !');
        process.exit();
    }

    /**
     *
     * @param {number} distance in cm
     * @return {Promise<Tello>}
     */
    left(distance = 50) {
        return this.sendCmd('left ' + distance);
    }

    /**
     *
     * @param {number} angle in degree
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
     * @param {number} distance in cm
     * @return {Promise<Tello>}
     */
    backward(distance = 50) {
        return this.sendCmd('back ' + distance);
    }

    /**
     *
     * @param {number} angle in degree
     * @return {Promise<Tello>}
     */
    rotateCCW(angle = 90) {
        return this.sendCmd('ccw ' + angle);
    }

    /**
     *
     * @param {number} height in cm
     * @return {Promise<Tello>}
     */
    up(height = 50) {
        return this.sendCmd('up ' + height);
    }

    /**
     *
     * @param {string} orientation values: f, b, l, r
     * @return {Promise<Tello>}
     */
    flip(orientation = 'f') {
        return this.sendCmd('flip ' + orientation);
    }

    /**
     *
     * @param {number} x in cm
     * @param {number} y in cm
     * @param {number} z in cm
     * @param {number} speed in cm/s
     * @return {Promise<Tello>}
     */
    flyTo(x = 50, y = 50, z = 0, speed = 100) {
        return this.sendCmd('go ' + x + ' ' + y + ' ' + z + ' ' + speed + ' ');
    }
}

module.exports = new Tello();
