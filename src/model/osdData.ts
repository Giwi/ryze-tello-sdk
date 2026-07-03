/** Fields parsed from the drone's OSD telemetry state string. */
export interface OSDData {
  /** Height (cm) */
  h: string;
  /** Barometer (cm) */
  baro: string;
  /** Time-of-flight / distance to floor (cm) */
  tof: string;
  /** Minimum temperature (°C) */
  templ: string;
  /** Maximum temperature (°C) */
  temph: string;
  /** Pitch angle (deg) */
  pitch: string;
  /** Roll angle (deg) */
  roll: string;
  /** Yaw angle (deg) */
  yaw: string;
  /** Acceleration X (0.001g) */
  agx: string;
  /** Acceleration Y (0.001g) */
  agy: string;
  /** Acceleration Z (0.001g) */
  agz: string;
  /** Velocity X (cm/s) */
  vgx: string;
  /** Velocity Y (cm/s) */
  vgy: string;
  /** Velocity Z (cm/s) */
  vgz: string;
  /** Battery level (%) */
  bat: string;
  /** Additional dynamic fields from the drone */
  [key: string]: string;
}