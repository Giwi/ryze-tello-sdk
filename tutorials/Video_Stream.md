### Use the video stream

Requires [mplayer](https://mplayerhq.hu) installed on your system.

```javascript
const { Tello } = require('@giwisoft/ryze-tello-sdk');
const tello = new Tello();

(async () => {
    await tello.start();
    console.log('battery', (await tello.get('bat')).value, '%');
    await tello.startStream();
    await tello.wait(10000);
    await tello.stopStream();
    await tello.stop();
})();
```