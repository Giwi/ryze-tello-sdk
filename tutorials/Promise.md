### Use it with promises

```javascript
const { Tello } = require('@giwisoft/ryze-tello-sdk');
const tello = new Tello();

tello.start()
    .then(() => tello.takeoff())
    .then(() => tello.forward(50))
    .then(() => tello.rotateCCW(360))
    .then(() => tello.get('h'))
    .then(r => console.log('height', r.value, 'cm'))
    .then(() => tello.backward(50))
    .then(() => tello.land())
    .then(() => tello.stop());
```