'use strict';
const tello = require('./lib/telloCommander');

tello
    .mock()
    .takeoff()
    .forward(50)
    .rotateCW(360)
    .backward(50)
    .land()
    .run().then(() => console.log('done'));