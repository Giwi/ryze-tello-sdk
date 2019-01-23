# Ryze Tello commands

NodeJS utility for the [Ryze Tello Drone](https://www.ryzerobotics.com/tello)

Video stream is supported, but you need mplayer.

## Usage

Connect to the Tello's Wifi

```javascript
'use strict';
const tello = require('./lib/tello');

tello.start()
    .then(() => tello.takeoff())
    .then(() => tello.forward(50))
    .then(() => tello.rotateCCW(360))
    .then(() => {
        return new Promise(resolve =>
            tello.get('h').then(r => {
                console.log('height', r.value);
                resolve()
            }));
    })
    .then(() => tello.backward(50))
    .then(() => tello.land())
    .then(() => tello.stop());
```    

or 

```javascript
const tello = require('./lib/tello');

'use strict';

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
```

## Tello flight vars

| Name | Unit | Description |
| --- | --- | --- |
| `h` | cm | height |
| `baro` | cm | barometer |
| `tof` | cm | to floor distance |
| `templ` | °C | min temperature |
| `temph` | °C | max temperature |
| `pitch` | ° | attitude pitch |
| `roll` | ° | attitude roll |
| `yaw` | ° | attitude yaw |
| `agx` | 0.001g | acceleration x |
| `agy` | 0.001g | acceleration y |
| `agz` | 0.001g | acceleration z |
| `vgx` | cm/s | speed x |
| `vgy` | cm/s | speed y |
| `vgz` | cm/s | speed z | 
| `bat` | % | battery |

## RoadMap

- [ ] Save video on the file system
- [ ] Take pictures
- [ ] RealTime remote control with web video stream
- [ ] Raspberry setup
- [ ] GamePad support on Raspberry
