import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {OSDData} from '../model/osdData';
import axios from 'axios';
import {Logger} from './logger';

dayjs.extend(utc);

const UNITS: Record<string, string> = {
  h: 'cm', x: 'cm', y: 'cm', z: 'cm', baro: 'cm', tof: 'cm',
  templ: 'celcius', temph: 'celcius',
  pitch: 'deg', roll: 'deg', yaw: 'deg',
  agx: '0.001g', agy: '0.001g', agz: '0.001g',
  vgx: 'cm/s', vgy: 'cm/s', vgz: 'cm/s',
  bat: 'percent', time: 'second'
};

export class Warp10 {
  private readonly url: string;
  private readonly token: string;

  constructor(params: { url: string; writeToken: string }) {
    this.url = params.url;
    this.token = params.writeToken;
  }

  pushData(osdData: OSDData) {
    const timestamp = dayjs().utc().valueOf() * 1000;
    const lines = Object.keys(osdData)
      .filter(k => k && k !== 'mpry' && k !== 'mid')
      .map(k => `${timestamp}// ryze.tello.${k}{unit=${encodeURIComponent(UNITS[k])}} ${osdData[k]}`)
      .join('\n');

    Logger.info('[Warp10]', 'pushData', lines);
    axios.post(this.url + '/update', lines, {
      headers: {
        'X-Warp10-Token': this.token,
        'Transfer-Encoding': 'chunked'
      }
    });
  }
}