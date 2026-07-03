import {spawn, ChildProcessWithoutNullStreams} from 'child_process';
import {EventEmitter} from 'events';
import {Logger} from './logger';
import {TelloWebServer} from '../servers/webServer';
import {TelloTelemetry} from '../servers/telemetry';
import {OSDData} from '../model/osdData';
import {createSocket, Socket} from 'dgram';
import {AddressInfo} from 'net';
import {Options} from '../model/options';
import open from 'open';

const HOST = '192.168.10.1';
const PORT = 8889;
const STATE_PORT = 8890;
const VIDEO_PORT = 11111;
const LOCAL_PORT = 50602;

/** Main drone interface. Wraps Tello's UDP command protocol, video stream, and telemetry into a fluent Promise API. */
export class Tello {

  private isMock = false;
  private isStreaming = false;
  private hasTelemetry = false;
  private emitter = new EventEmitter();
  private osdData: OSDData = {} as OSDData;
  private deviceIP = HOST;
  private UDPClient!: Socket;
  private UDPServer!: Socket;
  private telloVideo?: Socket;
  private h264encoder?: ChildProcessWithoutNullStreams;
  private telloWebServer = new TelloWebServer();
  private telloTelemetry = new TelloTelemetry();

  /** Wait for a given number of milliseconds, then resolve. */
  wait(time: number): Promise<Tello> {
    return new Promise<Tello>(resolve => setTimeout(() => resolve(this), time));
  }

  /** Stop the video stream and kill the mplayer subprocess. */
  stopStream(): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      this.sendCmd('streamoff').then(() => {
        this.telloVideo?.close();
        this.telloVideo = undefined;
        this.h264encoder?.kill();
        this.isStreaming = false;
        resolve(this);
      });
    });
  }

  /** Start the video stream. Opens a UDP socket on port 11111 and pipes H.264 data to mplayer. */
  startStream(): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      this.sendCmd('streamon').then(() => {
        this.telloVideo = createSocket('udp4');
        this.h264encoder = spawn('mplayer', ['-gui', '-nolirc', '-fps', '35', '-really-quiet', '-']);
        this.h264encoder.stderr.on('data', data => {
          Logger.error('[Tello]', 'mplayer error', data.toString());
        });
        this.telloVideo.on('message', msg => this.h264encoder?.stdin.write(msg));
        this.telloVideo.on('listening', () => {
          const addr = this.telloVideo!.address() as AddressInfo;
          Logger.info('[Tello]', `tello_video listening ${addr.address}:${addr.port}`);
          this.isStreaming = true;
          resolve(this);
        });
        this.telloVideo.bind(VIDEO_PORT, '0.0.0.0');
      });
    });
  }

  /** Switch to mock mode: send commands to 127.0.0.1 instead of the drone. */
  mock(): Tello {
    this.deviceIP = '127.0.0.1';
    this.isMock = true;
    return this;
  }

  /** Start the telemetry dashboard and WebSocket server. Opens the browser unless BROWSER=none. */
  startTelemetry(options: Options): Promise<Tello> {
    if (this.isMock) return Promise.resolve(this);
    return new Promise<Tello>(resolve => {
      this.telloWebServer.start().then(() => {
        this.runTelemetry(options).then(() => resolve(this));
      });
    });
  }

  private runTelemetry(options: Options): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      this.telloTelemetry.start(options).then(() => {
        this.hasTelemetry = true;
        const finish = () => {
          Logger.info('[Tello]', 'Telemetry started');
          resolve(this);
        };
        if (process.env.BROWSER === 'none') {
          finish();
        } else {
          open('http://127.0.0.1:3000/telemetry.html').then(finish);
        }
      });
    });
  }

  /** Stop the telemetry server and web server. */
  stopTelemetry(): Promise<Tello> {
    return new Promise(resolve => {
      this.shutDownTelemetry().then(() => {
        this.telloTelemetry.stop().then(() => {
          Logger.info('[Tello]', 'Stopping telemetry');
          resolve(this);
        });
      });
    });
  }

  private shutDownTelemetry(): Promise<Tello> {
    if (this.isMock) return Promise.resolve(this);
    return new Promise<Tello>(resolve => {
      this.telloWebServer.stop().then(() => resolve(this));
    });
  }

  /** Read a single OSD telemetry field by name (e.g. 'bat', 'h', 'templ'). */
  get(value: string): Promise<{ value: string; tello: Tello }> {
    return Promise.resolve({value: this.osdData[value], tello: this});
  }

  private listenState() {
    if (this.hasTelemetry) {
      this.UDPServer.on('message', msg => {
        const strMsg = msg.toString().trim();
        strMsg.split(';').forEach(field => {
          const [key, val] = field.split(':');
          this.osdData[key] = val;
        });
        this.telloTelemetry.send(this.osdData);
      });
      this.UDPServer.on('listening', () => {
        const address = this.UDPServer.address() as AddressInfo;
        Logger.info('[Tello]', 'server listening', address.address, address.port);
      });
      this.UDPServer.bind(STATE_PORT, '0.0.0.0');
    }
  }

  private sendRaw(cmd: string): Promise<Tello> {
    return new Promise<Tello>((resolve, reject) => {
      const message = Buffer.from(cmd);
      Logger.info('[Tello]', 'send:', cmd);
      this.UDPClient.send(message, 0, message.length, PORT, this.deviceIP, err => {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  /** Low-level command: send a raw string to the drone and wait for 'ok' response. */
  sendCmd(cmd: string): Promise<Tello> {
    return new Promise<Tello>((resolve, reject) => {
      this.sendRaw(cmd).then(() => {
        this.emitter.once('status', () => resolve(this));
      }).catch(reject);
    });
  }

  /** Stop all motors immediately. */
  emergencyStop(): Promise<Tello> { return this.sendCmd('emergency'); }
  /** Auto-takeoff. */
  takeoff(): Promise<Tello> { return this.sendCmd('takeoff'); }
  /** Auto-land. */
  land(): Promise<Tello> { return this.sendCmd('land'); }

  /** Fly a curve between two points (x1,y1,z1 → x2,y2,z2) at the given speed (cm/s). */
  curve(x1 = 20, y1 = 20, z1 = 20, x2 = 60, y2 = 40, z2 = 0, speed = 60): Promise<Tello> {
    return this.sendCmd(`curve ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${speed} `);
  }

  /** Fly forward by distance (cm). */
  forward(distance = 50): Promise<Tello> { return this.sendCmd(`forward ${distance}`); }
  /** Fly backward by distance (cm). */
  backward(distance = 50): Promise<Tello> { return this.sendCmd(`back ${distance}`); }
  /** Fly left by distance (cm). */
  left(distance = 50): Promise<Tello> { return this.sendCmd(`left ${distance}`); }
  /** Fly right by distance (cm). */
  right(distance = 50): Promise<Tello> { return this.sendCmd(`right ${distance}`); }
  /** Fly up by height (cm). */
  up(height = 50): Promise<Tello> { return this.sendCmd(`up ${height}`); }
  /** Fly down by height (cm). */
  down(height = 50): Promise<Tello> { return this.sendCmd(`down ${height}`); }
  /** Set drone speed (cm/s). */
  speed(speed = 50): Promise<Tello> { return this.sendCmd(`speed ${speed}`); }
  /** Rotate clockwise by angle (degrees). */
  rotateCW(angle = 90): Promise<Tello> { return this.sendCmd(`cw ${angle}`); }
  /** Rotate counter-clockwise by angle (degrees). */
  rotateCCW(angle = 90): Promise<Tello> { return this.sendCmd(`ccw ${angle}`); }
  /** Perform a flip in the given direction: 'f' (forward), 'b' (back), 'l' (left), 'r' (right). */
  flip(orientation = 'f'): Promise<Tello> { return this.sendCmd(`flip ${orientation}`); }
  /** Fly to coordinates (x, y, z) at speed (cm/s). */
  flyTo(x = 50, y = 50, z = 0, speed = 100): Promise<Tello> {
    return this.sendCmd(`go ${x} ${y} ${z} ${speed} `);
  }

  /** Initialise the UDP connection to the drone and enter SDK mode. */
  start(): Promise<Tello> {
    this.emitter.setMaxListeners(20);
    return new Promise<Tello>(resolve => {
      this.UDPClient = createSocket('udp4');
      if (this.hasTelemetry) {
        this.UDPServer = createSocket('udp4');
      }
      this.UDPClient.bind(LOCAL_PORT, '0.0.0.0', () => {
        Logger.info('[Tello]', 'connected');
        this.sendCmd('command').then(() => resolve(this));
      });
      process.on('SIGINT', () => this.stop());
      this.UDPClient.on('message', msg => {
        if (msg.toString() === 'ok') {
          Logger.info('[Tello]', 'Data received from drone:', msg.toString());
        } else {
          Logger.error('[Tello]', 'unexpected response', msg);
        }
        this.emitter.emit('status');
      });
      this.listenState();
    });
  }

  /** Close all connections, kill subprocesses, and exit. */
  async stop() {
    this.UDPClient.close();
    if (this.hasTelemetry) this.UDPServer.close();
    this.telloVideo?.close();
    this.h264encoder?.kill();
    if (!this.isMock && this.hasTelemetry) await this.stopTelemetry();
    Logger.info('[Tello]', 'Goodbye!');
    process.exit(0);
  }
}