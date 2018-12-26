# Ryze Tello commands

## Usage

Connect to the Tello's Wifi

```javascript
'use strict';
const tello = require('./lib/telloCommander');

tello
    .takeoff()
    .forward(50)
    .rotateCW(360)
    .backward(50)
    .land()
    .run().then(() => console.log('done'));
```    

## Mock server

    node src/mock_server.js

And then

```javascript
'use strict';
const tello = require('./lib/telloCommander');

tello
    .mock() // use mock server
    .takeoff()
    .forward(50)
    .rotateCW(360)
    .backward(50)
    .land()
    .run().then(() => console.log('done'));
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
