### Forward telemetry to MQTT

Publish live OSD data to an MQTT broker so you can consume it from other applications (Node-RED, Home Assistant, custom dashboards, etc.).

#### Prerequisites

An MQTT broker such as [Mosquitto](https://mosquitto.org):

```bash
# Install Mosquitto on macOS
brew install mosquitto
brew services start mosquitto

# Install Mosquitto on Debian / Ubuntu
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

The broker does not need to run on the same machine as the SDK, just make sure the URL is reachable.

#### Usage

```javascript
const { Tello } = require('@giwisoft/ryze-tello-sdk');
const tello = new Tello();

(async () => {
    await tello.start();
    await tello.startTelemetry({
        withMqtt: true,
        mqttParams: {
            url: 'mqtt://127.0.0.1:1883',
            clientId: 'tello-sdk'
        }
    });
    await tello.takeoff();
    // ... your flight sequence ...
    await tello.land();
    await tello.stopTelemetry();
    await tello.stop();
})();
```

#### What gets published

The SDK publishes a JSON frame to the `ryze.tello` topic once per second (throttled):

```json
{
  "timestamp": 1783113460538000000,
  "h": "50",
  "bat": "85",
  "pitch": "0",
  "roll": "1",
  ...
}
```

Verify with a subscriber:

```bash
mosquitto_sub -h 127.0.0.1 -t ryze.tello
```

#### Related

- [Mosquitto MQTT broker](https://mosquitto.org)
- [MQTT specification](https://mqtt.org)
- [Node-RED with MQTT](https://nodered.org/docs/user-guide/messages)
