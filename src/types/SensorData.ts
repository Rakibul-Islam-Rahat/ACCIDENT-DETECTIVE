export interface SensorData {
  servoAngle: number | null;
  sonar1: number | null;
  sonar2: number | null;
  motion: boolean | null;
  /** True if this packet was produced by the demo simulator, not real hardware. */
  isDemoData: boolean;
  timestamp: string;
}

export const EMPTY_SENSOR_DATA: SensorData = {
  servoAngle: null,
  sonar1: null,
  sonar2: null,
  motion: null,
  isDemoData: false,
  timestamp: new Date(0).toISOString(),
};
