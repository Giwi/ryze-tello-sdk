# Ryze Tello SDK

Node.js SDK for the [Ryze Tello Drone](https://www.ryzerobotics.com/tello).  
Provides a fluent Promise-based API for drone commands, live telemetry, and video streaming.

## Install

```bash
npm install @giwisoft/ryze-tello-sdk
```

Connect your computer to the Tello's Wi-Fi network, then:

```typescript
import { Tello } from '@giwisoft/ryze-tello-sdk';

const tello = new Tello();

(async () => {
  await tello.start();
  await tello.takeoff();
  await tello.up(50);
  await tello.flip('f');
  await tello.forward(50);
  console.log('Battery:', (await tello.get('bat')).value, '%');
  await tello.land();
  await tello.stop();
})();
```

## Telemetry dashboard

Start the telemetry server to view real-time OSD data in your browser:

```typescript
await tello.startTelemetry({
  withMqtt: false,
  withWarp10: false
});
```

This opens a live dashboard at `http://localhost:3000/telemetry.html` with charts for height, speed, temperature, acceleration, and rotation. Data is pushed via WebSocket.

### Telemetry forwarders

Optionally forward telemetry to external services:

| Forwarder | Config | Description |
|-----------|--------|-------------|
| **Warp 10** | `{ withWarp10: true, warp10Params: { url, writeToken } }` | Time-series database ingest |
| **MQTT** | `{ withMqtt: true, mqttParams: { url, clientId } }` | Publish to `ryze.tello` topic |

## Mock server

Test your code without a physical drone:

```bash
npm run mock
```

Then use the SDK in mock mode:

```typescript
const tello = new Tello();
tello.mock().start().then(() => tello.takeoff());
```

The mock server echoes commands and responses over WebSocket — open `http://localhost:3000/mockServer.html` to watch the traffic.

## Video stream

Requires [mplayer](https://mplayerhq.hu) installed on your system.

```typescript
await tello.startStream(); // starts H.264 video → mplayer
await tello.wait(10000);
await tello.stopStream();
```

## Flight vars / OSD fields

| Name | Unit | Description |
| --- | --- | --- |
| `h` | cm | Height |
| `baro` | cm | Barometer |
| `tof` | cm | Distance to floor |
| `templ` | °C | Minimum temperature |
| `temph` | °C | Maximum temperature |
| `pitch` | ° | Attitude pitch |
| `roll` | ° | Attitude roll |
| `yaw` | ° | Attitude yaw |
| `agx` | 0.001g | Acceleration X |
| `agy` | 0.001g | Acceleration Y |
| `agz` | 0.001g | Acceleration Z |
| `vgx` | cm/s | Speed X |
| `vgy` | cm/s | Speed Y |
| `vgz` | cm/s | Speed Z |
| `bat` | % | Battery level |

## API docs

Full API documentation: [https://giwi.github.io/ryze-tello-sdk](https://giwi.github.io/ryze-tello-sdk)
