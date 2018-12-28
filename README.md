# Ryze Tello commands

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
(async () => {
    await tello.start();
    await tello.takeoff();
    console.log('battery', (await tello.get('bat')).value, '%');
    await tello.up(50);
    await tello.flip('f');
    await tello.forward(50);
    console.log('height', (await tello.get('h')).value, 'cm');
    await tello.backward(100);
    await tello.land();
})().then(() => tello.stop());
```
## Mock server

This server does not support telemetry.

    npm run mock
or

    yarn mock

And then

```javascript
const tello = require('./lib/tello');

'use strict';
tello.mock().start()
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
(async () => {
    await tello.mock().start();
    await tello.takeoff();
    console.log('battery', (await tello.get('bat')).value, '%');
    await tello.up(50);
    await tello.flip('f');
    await tello.forward(50);
    console.log('height', (await tello.get('h')).value, 'cm');
    await tello.backward(100);
    await tello.land();
})().then(() => tello.stop());
```

## Tello flight vars

- height(cm): *h*
- barometer(cm): *baro*
- tof distance(cm): *tof*
- min temperature(°C): *templ*
- max temperature(°C): *temph*
- attitude pitch(°): *pitch*
- attitude roll(°): *roll*
- attitude yaw(°): *yaw*
- acceleration x(0.001g): *agx*
- acceleration y(0.001g): *agy*
- acceleration z(0.001g): *agz*
- speed x(cm/s): *vgx*
- speed y(cm/s): *vgy*
- speed z(cm/s): *vgz*
- battery(%): *bat*
