import { Tello } from "./lib/tello";

const tello = new Tello();

(async() => {
  // Start the engine
  await tello.start();
  await tello.startStream();
  await tello.startTelemetry();
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
  await tello.stopTelemetry();
  await tello.stopStream();
  // And then shut down the engine
})().then(() => tello.stop());