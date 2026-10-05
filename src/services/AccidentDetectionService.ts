/**
 * AccidentDetectionService
 *
 * PROTOTYPE HEURISTIC — this is intentionally simple and NOT a
 * scientifically validated accident-detection algorithm. It exists to
 * give the pipeline a concrete, honest, extensible trigger point:
 *
 *   sensor data / motion  --> "is this worth analyzing?"  --> Gemini
 *
 * Replace `shouldTriggerAnalysis` with real logic (e.g. sonar delta
 * thresholds tuned to your rig, debounced motion, etc.) as the ESP32
 * firmware and physical setup mature. Nothing here pretends otherwise.
 */
import { SensorData } from '../types';

const SONAR_DELTA_THRESHOLD_CM = 12;
const MIN_MS_BETWEEN_TRIGGERS = 8000;

class AccidentDetectionServiceImpl {
  private lastSensor: SensorData | null = null;
  private lastTriggerAt = 0;

  /**
   * Prototype heuristic: trigger analysis when motion is newly detected,
   * or when either sonar reading jumps by more than the threshold
   * between consecutive readings. Debounced so we don't spam Gemini.
   */
  shouldTriggerAnalysis(current: SensorData): boolean {
    const now = Date.now();
    const previous = this.lastSensor;
    this.lastSensor = current;

    if (now - this.lastTriggerAt < MIN_MS_BETWEEN_TRIGGERS) {
      return false;
    }

    if (current.motion === true) {
      this.lastTriggerAt = now;
      return true;
    }

    if (previous) {
      const delta1 =
        previous.sonar1 !== null && current.sonar1 !== null
          ? Math.abs(current.sonar1 - previous.sonar1)
          : 0;
      const delta2 =
        previous.sonar2 !== null && current.sonar2 !== null
          ? Math.abs(current.sonar2 - previous.sonar2)
          : 0;

      if (delta1 >= SONAR_DELTA_THRESHOLD_CM || delta2 >= SONAR_DELTA_THRESHOLD_CM) {
        this.lastTriggerAt = now;
        return true;
      }
    }

    return false;
  }

  reset(): void {
    this.lastSensor = null;
    this.lastTriggerAt = 0;
  }
}

export const AccidentDetectionService = new AccidentDetectionServiceImpl();
