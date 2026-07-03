### Forward telemetry to Warp 10

Ingest live OSD data into [Warp 10](https://warp10.io), a time-series platform purpose-built for sensor and IoT data. Data is formatted as Warp 10 GTS (Geo Time Series) input and sent via HTTP POST.

#### Prerequisites

A running Warp 10 instance with a write token. The easiest way to get started:

```bash
# Run Warp 10 locally with Docker
docker run -d --name warp10 -p 8080:8080 warp10io/warp10:latest

# Get a write token (the sandbox generates one at startup - check the logs)
docker logs warp10 2>&1 | grep "Write token"
```

You can also use the [Warp 10 Sandbox](https://sandbox.warp10.io) for testing.

#### Usage

```javascript
const { Tello } = require('@giwisoft/ryze-tello-sdk');
const tello = new Tello();

(async () => {
    await tello.start();
    await tello.startTelemetry({
        withWarp10: true,
        warp10Params: {
            url: 'http://127.0.0.1:8080/api/v0',
            writeToken: 'YOUR_WRITE_TOKEN'
        }
    });
    await tello.takeoff();
    // ... your flight sequence ...
    await tello.land();
    await tello.stopTelemetry();
    await tello.stop();
})();
```

#### GTS format

Each telemetry frame produces one data point per field in the GTS format:

```
<timestamp>// ryze.tello.<field>{unit=<unit>} <value>
```

For example:

```
1783113460538000// ryze.tello.h{unit=cm} 50
1783113460538000// ryze.tello.bat{unit=percent} 85
1783113460538000// ryze.tello.templ{unit=celcius} 20
```

Fields `mid` and `mpry` are excluded. All other OSD fields are pushed with their corresponding unit metadata.

#### Query example (WarpScript)

```warpScript
'ryze.tello.h'  // class selector
{ 'unit' 'cm' } // labels filter
NOW 1 h          // time window
FETCH            // retrieve data
...
```

#### Related

- [Warp 10](https://warp10.io) - time-series platform
- [Warp 10 Sandbox](https://sandbox.warp10.io) - free online playground
- [WarpScript](https://warp10.io/content/03_Documentation/04_WarpScript/) - query language
- [GTS input format](https://warp10.io/content/03_Documentation/03_Ingestion/) - data ingestion docs
