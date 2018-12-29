### Use it with async / await

```javascript
const tello = require('./lib/tello');

'use strict';
(async () => {
    await tello.start();
    await tello.startStream();
    await tello.wait(10000);
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