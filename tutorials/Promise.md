### Use it with promises
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