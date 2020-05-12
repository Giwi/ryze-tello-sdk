import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import {OSDData} from "../model/osdData";
import axios, {AxiosRequestConfig, AxiosPromise} from 'axios';
import {Logger} from "./logger";

dayjs.extend(utc);

/**
 *
 */
export class Warp10 {
  private warp10Params: { url: string; writeToken: string };

  private units = {
    h: 'cm',
    x: 'cm',
    y: 'cm',
    z: 'cm',
    baro: 'cm',
    tof: 'cm',
    templ: 'celcius',
    temph: 'celcius',
    pitch: 'deg',
    roll: 'deg',
    yaw: 'deg',
    agx: '0.001g',
    agy: '0.001g',
    agz: '0.001g',
    vgx: 'cm/s',
    vgy: 'cm/s',
    vgz: 'cm/s',
    bat: 'percent',
    time: 'second'
  };

  /**
   *
   * @param {{url: string; writeToken: string}} warp10Params
   */
  constructor(warp10Params: { url: string; writeToken: string }) {
    this.warp10Params = warp10Params;
  }

  /**
   *
   * @param {OSDData} osdData
   */
  pushData(osdData: OSDData) {
    let inputFormat = '';
    const timestamp = dayjs().utc().valueOf() * 1000;
    Object.keys(osdData).forEach(k => {
      if (k && k !== 'mpry' && k !== 'mid')
        inputFormat += `${timestamp}// ryze.tello.${k}{unit=${encodeURIComponent(this.units[k])}} ${osdData[k]}
`;
    });

    Logger.info('[Warp10]', 'pushData', inputFormat);
    axios.post(this.warp10Params.url + '/update', inputFormat, {
      headers: {
        'X-Warp10-Token': this.warp10Params.writeToken,
        'Transfer-Encoding': 'chunked'
      }
    });
  }
}
