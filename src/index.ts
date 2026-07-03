import {Tello} from './lib/tello';

const tello = new Tello();

(async () => {
  await tello.start();
  await tello.takeoff();
  await tello.up(50);
  await tello.flip('f');
  await tello.forward(50);
  await tello.right(20);
  await tello.backward(100);
  await tello.rotateCW(360);
  await tello.land();
})().then(() => tello.stop());