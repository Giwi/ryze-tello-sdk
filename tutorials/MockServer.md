### Use the mock server

The mock server simulates the Tello drone over UDP on `127.0.0.1` so you can develop and test without a physical drone.

> Does not support video stream or telemetry.

Start the server:

```bash
npm run mock
```

Then use the SDK in mock mode:

```javascript
const { Tello } = require('@giwisoft/ryze-tello-sdk');
const tello = new Tello();

tello.mock().start()
    .then(() => tello.takeoff())
    .then(() => tello.forward(50))
    .then(() => tello.land())
    .then(() => tello.stop());
```

or with async / await:

```javascript
const { Tello } = require('@giwisoft/ryze-tello-sdk');
const tello = new Tello();

(async () => {
    await tello.mock().start();
    await tello.takeoff();
    console.log('battery', (await tello.get('bat')).value, '%');
    await tello.up(50);
    await tello.flip('f');
    await tello.forward(50);
    await tello.land();
    await tello.stop();
})();
```

Open `http://localhost:3000/mockServer.html` to watch commands and responses in real time.