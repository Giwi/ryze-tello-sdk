import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { Logger } from './logger';
import { TelloWebServer } from '../servers/webServer';
import { TelloTelemetry } from '../servers/telemetry';
import { OSDData } from '../model/osdData';
import { createSocket, Socket } from 'dgram';
import { AddressInfo } from 'net';
import opn = require('opn');

/**
 *
 */
export class Tello {

  private PORT = 8889;
  private HOST = '192.168.10.1';
  private PORT2 = 8890;
  private HOST2 = '0.0.0.0';
  private localPort = 50602;
  private isMock = false;
  private isStreming = false;
  private hasTelemetry = false;
  private myEmitter = new EventEmitter();
  private osdData: OSDData = new OSDData();
  private deviceIP = this.HOST;
  private UDPClient : Socket;
  private UDPServer: Socket;
  private h264encoder;
  private h264encoder_spawn;
  private tello_video;
  private telloWebServer: TelloWebServer = new TelloWebServer();
  private telloTelemetry: TelloTelemetry = new TelloTelemetry();

  /**
   *
   * @param {number}  time in ms
   * @return {Promise<Tello>}
   */
  async wait(time: number): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      setTimeout(() => {
        resolve(this);
      }, time);
    });
  };


  /**
   *
   * @return {Promise<Tello>}
   */
  stopStream(): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      this.sendCmd('streamoff').then(() => {
        if(this.tello_video) {
          this.tello_video.close();
          this.tello_video = undefined;
        }
        if(this.h264encoder) {
          this.h264encoder.kill();
        }
        this.isStreming = false;
        resolve(this)
      });
    });
  }

  /**
   *
   * @return {Promise<Tello>}
   */
  startStream(): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      this.sendCmd('streamon').then(() => {
        this.tello_video = createSocket({ type: 'udp4', reuseAddr: true });
        this.h264encoder_spawn = {
          'command': 'mplayer',
          'args': [ '-gui', '-nolirc', '-fps', '35', '-really-quiet', '-' ]
        };
        this.h264encoder = spawn(this.h264encoder_spawn.command, this.h264encoder_spawn.args);
      /*  this.h264encoder.on('close', (code) => {
          Logger.error('[Tello]', `child process exited with code ${code}`);
        });*/
        this.h264encoder.stderr.on('data', data => {
          Logger.error('[Tello]', 'mplayer error', data.toString());
        });

        /*  this.h264encoder.stdout.on('data', data => {
              const idx = data.indexOf(this.headers['h264_baseline']);
              if (idx > -1 && this.h264chunks.length > 0) {
                  this.h264chunks.push(data.slice(0, idx));
                  if (this.hasTelemetry) {
                      try {
                          TelloTelemetry.sendVideo(Buffer.concat(this.h264chunks).toString('binary'));
                      } catch (e) {
                      }
                  }
                  this.h264chunks = [];
                  this.h264chunks.push(data.slice(idx));
              } else {
                  this.h264chunks.push(data);
              }
          });*/
        this.tello_video.on('message', msg => this.h264encoder.stdin.write(msg));
        this.tello_video.on('listening', () => {
          Logger.info('[Tello]', `tello_video listening ${this.tello_video.address().address}:${this.tello_video.address().port}`);
          this.isStreming = true;
          resolve(this)
        });
        this.tello_video.bind(11111, this.HOST2);
      });
    });
  }

  /**
   *
   * @return {Tello}
   */
  mock(): Tello {
    this.deviceIP = '127.0.0.1';
    this.isMock = true;
    return this;
  }

  /**
   *
   * @param {boolean} withWarp10
   * @param {{url: string; writeToken: string}} warp10Params
   * @returns {Promise<Tello>}
   */
  startTelemetry(withWarp10: boolean = false, warp10Params?: { url: string; writeToken: string }): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      if(!this.isMock) {
        this.telloWebServer.start().then(() => {
          this.runTelemetry(withWarp10,warp10Params).then(() => resolve(this));
        })
      }
    });
  }

  /**
   *
   * @param {boolean} withWarp10
   * @param {{url: string; writeToken: string}} warp10Params
   * @returns {Promise<Tello>}
   */
  private runTelemetry(withWarp10: boolean = false, warp10Params?: { url: string; writeToken: string }): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      this.telloTelemetry.start(withWarp10, warp10Params).then(() => {
        this.hasTelemetry = true;
        opn('http://127.0.0.1:3000/telemetry.html').then(() => {
          Logger.info('[Tello]', `Telemetry started`);
          resolve(this);
        });
      });
    });
  }

  /**
   *
   * @return {Promise<Tello>}
   */
  stopTelemetry(): Promise<Tello> {
    return new Promise(resolve => {
      this.shutDownTelemetry().then(() => {
        this.telloTelemetry.stop().then(() => {
          this.hasTelemetry = true;
          Logger.info('[Tello]', `Stopping telemetry`);
          resolve(this);
        });
      });
    });
  }

  /**
   *
   * @return {Promise<Tello>}
   */
  private shutDownTelemetry(): Promise<Tello> {
    return new Promise<Tello>(resolve => {
      if(!this.isMock) {
        this.telloWebServer.stop().then(() => resolve(this));
      } else {
        resolve(this);
      }
    });
  }

  /**
   *
   * @param {string} value
   * @return {Promise<{value: string, tello: Tello}>}
   */
  get(value: string): Promise<{ value: string, tello: Tello }> {
    return Promise.resolve({ value: this.osdData[ value ], tello: this });
  }

  /**
   *
   */
  listenState() {
    this.UDPServer.on('message', msg => {
      const strMsg = msg.toString().trim();
      const fieldList = strMsg.split(';');
      fieldList.forEach(field => {
        const fields = field.split(':');
        this.osdData[ fields[ 0 ] ] = fields[ 1 ];
        if(this.hasTelemetry) {
          this.telloTelemetry.send(this.osdData);
        }
      });
      /*     Logger.info('fieldList', fieldList)
           Logger.info('osdData', osdData)*/
    });

    this.UDPServer.on('listening', () => {
      const address = this.UDPServer.address() as AddressInfo;
      Logger.info('[Tello]', 'server listening', address.address, address.port);
    });
    this.UDPServer.bind(this.PORT2, this.HOST2);
  }

  /**
   *
   * @param {string} cmd
   * @return {Promise<Tello>}
   */
  sendMethod(cmd: string): Promise<Tello> {
    return new Promise<Tello>((resolve, reject) => {
      const message = new Buffer(cmd);
      Logger.info('[Tello]', 'send:', cmd);
      this.UDPClient.send(message, 0, message.length, this.PORT, this.deviceIP, err => {
        if(err) {
          reject(err);
        } else {
          resolve(this)
        }
      });
    });
  }

  /**
   *
   * @param {string} cmd
   * @return {Promise<Tello>}
   */
  sendCmd(cmd: string): Promise<Tello> {
    return new Promise<Tello>(((resolve, reject) => {
      this.sendMethod(cmd).then(() => {
        this.myEmitter.on('status', () => {
          resolve(this);
        });
      }).catch(err => {
        reject(err);
      });
    }));
  }

  /**
   *
   * @return {Promise<Tello>}
   */
  async emergencyStop(): Promise<Tello> {
    return this.sendCmd('emergency');
  }

  /**
   *
   * @return {Promise<Tello>}
   */
  takeoff(): Promise<Tello> {
    return this.sendCmd('takeoff');
  }

  /**
   *
   * @param {number} x1 in cm
   * @param {number} y1 in cm
   * @param {number} z1 in cm
   * @param {number} x2 in cm
   * @param {number} y2 in cm
   * @param {number} z2 in cm
   * @param {number} speed in cm/s
   * @return {Promise<Tello>}
   */
  curve(x1 = 20, y1 = 20, z1 = 20, x2 = 60, y2 = 40, z2 = 0, speed = 60): Promise<Tello> {
    return this.sendCmd(`curve ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${speed} `);
  }

  /**
   *
   * @param {number} distance in cm
   * @return {Promise<Tello>}
   */
  forward(distance = 50): Promise<Tello> {
    return this.sendCmd(`forward ${distance}`);
  }

  /**
   *
   * @return {Promise<Tello>}
   */
  start(): Promise<Tello> {
    this.myEmitter.setMaxListeners(20);
    return new Promise<Tello>(resolve => {
      this.UDPClient = createSocket({ type: 'udp4', reuseAddr: true });
      this.UDPServer = createSocket({ type: 'udp4', reuseAddr: true });
      this.UDPClient.bind(this.localPort, '0.0.0.0', () => {
        Logger.info('[Tello]', 'connected');
        this.sendCmd('command').then(() => {
          resolve(this);
        });
      });
      process.on('SIGINT', async() => {
        await this.stop();
      });
      this.UDPClient.on('message', msg => {
        if(msg.toString() === 'ok') {
          Logger.info('[Tello]', 'Data received from server : ', msg.toString());
        } else {
          Logger.error('[Tello]', 'not ok', msg);
        }
        this.myEmitter.emit('status');
      });
      this.listenState();
    });
  }

  /**
   *
   * @param {number} distance in cm
   * @return {Promise<Tello>}
   */
  right(distance = 50): Promise<Tello> {
    return this.sendCmd(`right ${distance}`);
  }

  /**
   *
   * @param {number} height in cm
   * @return {Promise<Tello>}
   */
  down(height = 50): Promise<Tello> {
    return this.sendCmd(`down ${height}`);
  }

  /**
   *
   * @param {number} speed in cm/s
   * @return {Promise<Tello>}
   */
  speed(speed = 50): Promise<Tello> {
    return this.sendCmd(`speed ${speed}`);
  }

  /**
   * Ends the process
   */
  async stop() {
    this.UDPClient.close();
    this.UDPServer.close();
    if(this.tello_video) {
      await this.tello_video.close();
    }
    if(this.h264encoder) {
      await this.h264encoder.kill();
    }
    if(!this.isMock && this.hasTelemetry) {
      await this.stopTelemetry();
    }
    Logger.info(new Date(), '[Tello]', 'Goodbye !');
    process.exit(0);
  }

  /**
   *
   * @param {number} distance in cm
   * @return {Promise<Tello>}
   */
  left(distance = 50): Promise<Tello> {
    return this.sendCmd(`left ${distance}`);
  }

  /**
   *
   * @param {number} angle in degree
   * @return {Promise<Tello>}
   */
  rotateCW(angle = 90): Promise<Tello> {
    return this.sendCmd(`cw ${angle}`);
  }

  /**
   *
   * @return {Promise<Tello>}
   */
  land(): Promise<Tello> {
    return this.sendCmd('land');
  }

  /**
   *
   * @param {number} distance in cm
   * @return {Promise<Tello>}
   */
  backward(distance = 50): Promise<Tello> {
    return this.sendCmd(`back ${distance}`);
  }

  /**
   *
   * @param {number} angle in degree
   * @return {Promise<Tello>}
   */
  rotateCCW(angle = 90): Promise<Tello> {
    return this.sendCmd(`ccw ${angle}`);
  }

  /**
   *
   * @param {number} height in cm
   * @return {Promise<Tello>}
   */
  up(height = 50): Promise<Tello> {
    return this.sendCmd(`up ${height}`);
  }

  /**
   *
   * @param {string} orientation values: f, b, l, r
   * @return {Promise<Tello>}
   */
  flip(orientation = 'f'): Promise<Tello> {
    return this.sendCmd(`flip ${orientation}`);
  }

  /**
   *
   * @param {number} x in cm
   * @param {number} y in cm
   * @param {number} z in cm
   * @param {number} speed in cm/s
   * @return {Promise<Tello>}
   */
  flyTo(x = 50, y = 50, z = 0, speed = 100): Promise<Tello> {
    return this.sendCmd(`go ${x} ${y} ${z} ${speed} `);
  }
}
