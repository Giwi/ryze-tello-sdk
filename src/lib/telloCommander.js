'use strict';
const tello = require('./tello');

/**
 *
 */
class TelloCommander {

    /**
     *
     */
    constructor() {
        this.commandChain = [];
    }

    /**
     * Use mock server
     * @return {TelloCommander}
     */
    mock() {
        tello.mock();
        return this;
    }

    /**
     *
     * @return {Promise<void>}
     */
    async run() {
        await tello.start();
        for (let i = 0; i < this.commandChain.length; i++) {
            const k = Object.keys(this.commandChain[i])[0];
            console.log('running', k, ...this.commandChain[i][k]);
            await tello[k](...this.commandChain[i][k]);
        }
        await tello.stop();
    }

    /**
     *
     * @return {TelloCommander}
     */
    takeoff() {
        this.commandChain.push({'takeoff': []});
        return this;
    }

    /**
     *
     * @param distance
     * @return {TelloCommander}
     */
    forward(distance = 50) {
        this.commandChain.push({'forward': [distance]});
        return this;
    }

    /**
     *
     * @param distance
     * @return {TelloCommander}
     */
    right(distance = 50) {
        this.commandChain.push({'right': [distance]});
        return this;
    }

    /**
     *
     * @param height
     * @return {TelloCommander}
     */
    down(height = 50) {
        this.commandChain.push({'down': [height]});
        return this;
    }

    /**
     *
     * @param speed
     * @return {TelloCommander}
     */
    speed(speed = 50) {
        this.commandChain.push({'speed': [speed]});
        return this;
    }

    /**
     *
     * @param distance
     * @return {TelloCommander}
     */
    left(distance = 50) {
        this.commandChain.push({'left': [distance]});
        return this;
    }

    /**
     *
     * @param angle
     * @return {TelloCommander}
     */
    rotateCW(angle = 90) {
        this.commandChain.push({'rotateCW': [angle]});
        return this;
    }

    /**
     *
     * @return {TelloCommander}
     */
    land() {
        this.commandChain.push({'land': []});
        return this;
    }

    /**
     *
     * @return {TelloCommander}
     */
    emergencyStop() {
        this.commandChain.push({'emergencyStop': []});
        return this;
    }

    /**
     *
     * @param distance
     * @return {TelloCommander}
     */
    backward(distance = 50) {
        this.commandChain.push({'backward': [distance]});
        return this;
    }

    /**
     *
     * @param angle
     * @return {TelloCommander}
     */
    rotateCCW(angle = 90) {
        this.commandChain.push({'rotateCCW': [angle]});
        return this;
    }

    /**
     *
     * @param height
     * @return {TelloCommander}
     */
    up(height = 50) {
        this.commandChain.push({'up': [height]});
        return this;
    }

    /**
     *
     * @param orientation
     * @return {TelloCommander}
     */
    flip(orientation = 'f') {
        this.commandChain.push({'flip': [orientation]});
        return this;
    }

    /**
     *
     * @param x
     * @param y
     * @param z
     * @param speed
     * @return {TelloCommander}
     */
    flyTo(x = 50, y = 50, z = 0, speed = 100) {
        this.commandChain.push({'flyTo': [x, y, z, speed]});
        return this;
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
     * @return {TelloCommander}
     */
    curve(x1 = 20, y1 = 20, z1 = 20, x2 = 60, y2 = 40, z2 = 0, speed = 60) {
        this.commandChain.push({'curve': [x1, y1, z1, x2, y2, z2, speed]});
        return this;
    }

    /**
     *
     * @param value
     * @return {Promise<any>}
     */
    get(value) {
        return new Promise(resolve => {
            resolve({value: tello.osdData[value], tello: this});
        })
    }
}

module.exports = new TelloCommander();