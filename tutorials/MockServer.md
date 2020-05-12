### Use the mock server

This server does not support telemetry neither video stream.

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