/**
 * Class representing a socket connection.
 *
 * @class
 * @tutorial socket-tutorial
 */
'use strict';
const tello = require('./lib/tello');
/*
(async () => {
    // Start the engine
    await tello.start();
    await tello.startStream();
    await tello.takeoff();
    // Read the battery status
    console.log('battery', (await tello.get('bat')).value, '%');
    // Go up
    await tello.up(50);
    // Perform a forward flip
    await tello.flip('f');
    // Go forward
    await tello.forward(50);
    await tello.right(20);
    // Read the height
    console.log('height', (await tello.get('h')).value, 'cm');
    // Go backward
    await tello.backward(100);
    await tello.rotateCW(360);
    // Finally land
    await tello.land();
    await tello.stopStream();
    // And then shut down the engine
})().then(() => tello.stop());

*/
(async () => {
    // Start the engine
    await tello.start();
    // await tello.startStream();
    await tello.startTelemetry();
    // Takeoff
  //   await tello.takeoff();
    // Read the battery status
 //   console.log('battery', (await tello.get('bat')).value, '%');
    // Go up
    // await tello.up(50);
    // Perform a forward flip
    // await tello.flip('f');
    // Go forward
    // await tello.forward(50);
    // Read the height
 //   console.log('height', (await tello.get('h')).value, 'cm');
    // Go backward
    //await tello.backward(100);
    // Finally land
    // await tello.land();
  //  await tello.stopStream();
    // And then shut down the engine
    await tello.wait(100000)
})().then(() => tello.stop())
