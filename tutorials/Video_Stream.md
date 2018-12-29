### Use the video stream

> You must have mplayer installed

```javascript
'use strict';
const tello = require('./lib/tello');

(async () => {
    // Start the engine
    await tello.start();
    console.log('battery', (await tello.get('bat')).value, '%');
    await tello.startStream();
    await tello.wait(10000);
    await tello.stopStream();
    // And then shut down the engine
})().then(() => tello.stop());
```