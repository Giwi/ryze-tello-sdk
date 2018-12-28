'use strict';
const tello = require('./lib/tello');

(async () => {
    // Start the engine
    await tello.mock().start();
    // Takeoff
    await tello.takeoff();
    // Read the battery status
    console.log('battery', (await tello.get('bat')).value, '%');
    // Go up
    await tello.up(50);
    // Perform a forward flip
    await tello.flip('f');
    // Go forward
    await tello.forward(50);
    // Read the height
    console.log('height', (await tello.get('h')).value, 'cm');
    // Go backward
    await tello.backward(100);
    // Finally land
    await tello.land();
    // And then shut down the engine
})().then(() => tello.stop());
