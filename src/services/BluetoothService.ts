/**
 * BluetoothService
 *
 * Wraps react-native-ble-plx to talk to the MINI-DETECTIVE ESP32 over
 * a Nordic-UART-style GATT profile. Designed to never throw out of its
 * public methods — callers get state/callbacks instead of exceptions
 * propagating into UI code.
 */
import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { Buffer } from 'buffer';
import {
  BLE_DEVICE_NAME,
  BLE_SERVICE_UUID,
  BLE_RX_CHARACTERISTIC_UUID,
  BLE_TX_CHARACTERISTIC_UUID,
  BLE_SCAN_TIMEOUT_MS,
  DEMO_MODE,
  DEMO_SENSOR_INTERVAL_MS,
} from '../config/appConfig';
import { SensorData } from '../types';

export type BleStatus = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

type StatusListener = (status: BleStatus, message?: string) => void;
type SensorListener = (data: SensorData) => void;

/** Parses "SERVO:90,S1:25,S2:30,MOTION:YES" tolerating whitespace/garbage. */
export function parseSensorPacket(raw: string): SensorData | null {
  try {
    const clean = raw.replace(/[\r\n]/g, '').trim();
    if (!clean) return null;

    const fields = clean.split(',').reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split(':').map(s => s?.trim());
      if (key && value !== undefined) acc[key.toUpperCase()] = value;
      return acc;
    }, {});

    const servoAngle = fields.SERVO !== undefined ? Number(fields.SERVO) : null;
    const sonar1 = fields.S1 !== undefined ? Number(fields.S1) : null;
    const sonar2 = fields.S2 !== undefined ? Number(fields.S2) : null;
    const motion = fields.MOTION !== undefined ? fields.MOTION.toUpperCase() === 'YES' : null;

    if (
      (servoAngle !== null && Number.isNaN(servoAngle)) ||
      (sonar1 !== null && Number.isNaN(sonar1)) ||
      (sonar2 !== null && Number.isNaN(sonar2))
    ) {
      return null;
    }

    if (servoAngle === null && sonar1 === null && sonar2 === null && motion === null) {
      return null; // nothing usable in this packet
    }

    return {
      servoAngle,
      sonar1,
      sonar2,
      motion,
      isDemoData: false,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return null; // never let malformed data throw
  }
}

class BluetoothServiceImpl {
  private manager: BleManager | null = null;
  private device: Device | null = null;
  private notifySubscription: Subscription | null = null;
  private scanTimeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private demoIntervalHandle: ReturnType<typeof setInterval> | null = null;

  private statusListeners = new Set<StatusListener>();
  private sensorListeners = new Set<SensorListener>();
  private status: BleStatus = 'DISCONNECTED';

  private getManager(): BleManager {
    if (!this.manager) {
      this.manager = new BleManager();
    }
    return this.manager;
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  onSensorData(listener: SensorListener): () => void {
    this.sensorListeners.add(listener);
    return () => this.sensorListeners.delete(listener);
  }

  private setStatus(status: BleStatus, message?: string) {
    this.status = status;
    this.statusListeners.forEach(l => {
      try {
        l(status, message);
      } catch {
        // ignore listener errors
      }
    });
  }

  private emitSensorData(data: SensorData) {
    this.sensorListeners.forEach(l => {
      try {
        l(data);
      } catch {
        // ignore listener errors
      }
    });
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      if (Platform.Version >= 31) {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      const state = await this.getManager().state();
      return state === State.PoweredOn;
    } catch {
      return false;
    }
  }

  /** Starts demo simulation instead of real hardware. Safe to call repeatedly. */
  private startDemoSimulation() {
    this.stopDemoSimulation();
    this.setStatus('CONNECTING', 'Demo mode: simulating connection');
    setTimeout(() => {
      this.setStatus('CONNECTED', 'Demo mode: simulated device connected');
      this.demoIntervalHandle = setInterval(() => {
        const demoData: SensorData = {
          servoAngle: Math.round(60 + Math.random() * 60),
          sonar1: Math.round(10 + Math.random() * 40),
          sonar2: Math.round(10 + Math.random() * 40),
          motion: Math.random() > 0.85,
          isDemoData: true,
          timestamp: new Date().toISOString(),
        };
        this.emitSensorData(demoData);
      }, DEMO_SENSOR_INTERVAL_MS);
    }, 800);
  }

  private stopDemoSimulation() {
    if (this.demoIntervalHandle) {
      clearInterval(this.demoIntervalHandle);
      this.demoIntervalHandle = null;
    }
  }

  /** Scans for and connects to the MINI-DETECTIVE ESP32. Never throws. */
  async connect(): Promise<void> {
    if (DEMO_MODE) {
      this.startDemoSimulation();
      return;
    }

    try {
      const permitted = await this.requestPermissions();
      if (!permitted) {
        this.setStatus('ERROR', 'Bluetooth/location permission denied');
        return;
      }

      const enabled = await this.isBluetoothEnabled();
      if (!enabled) {
        this.setStatus('ERROR', 'Bluetooth is turned off');
        return;
      }

      this.setStatus('SCANNING');
      const manager = this.getManager();

      const found: Device = await new Promise((resolve, reject) => {
        this.scanTimeoutHandle = setTimeout(() => {
          manager.stopDeviceScan();
          reject(new Error('Scan timed out — device not found'));
        }, BLE_SCAN_TIMEOUT_MS);

        manager.startDeviceScan([BLE_SERVICE_UUID], null, (error, scannedDevice) => {
          if (error) {
            if (this.scanTimeoutHandle) clearTimeout(this.scanTimeoutHandle);
            manager.stopDeviceScan();
            reject(error);
            return;
          }
          if (scannedDevice?.name === BLE_DEVICE_NAME) {
            if (this.scanTimeoutHandle) clearTimeout(this.scanTimeoutHandle);
            manager.stopDeviceScan();
            resolve(scannedDevice);
          }
        });
      });

      this.setStatus('CONNECTING');
      const connected = await found.connect();
      await connected.discoverAllServicesAndCharacteristics();
      this.device = connected;

      this.notifySubscription = connected.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        BLE_TX_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error || !characteristic?.value) return;
          try {
            const raw = Buffer.from(characteristic.value, 'base64').toString('utf-8');
            const parsed = parseSensorPacket(raw);
            if (parsed) this.emitSensorData(parsed);
          } catch {
            // malformed packet — ignore, keep listening
          }
        },
      );

      connected.onDisconnected(() => {
        this.setStatus('DISCONNECTED', 'Device disconnected');
        this.device = null;
      });

      this.setStatus('CONNECTED');
    } catch (err) {
      this.setStatus('ERROR', err instanceof Error ? err.message : 'Unknown BLE error');
    }
  }

  async sendCommand(command: string): Promise<boolean> {
    if (DEMO_MODE || !this.device) return false;
    try {
      const base64 = Buffer.from(command, 'utf-8').toString('base64');
      await this.device.writeCharacteristicWithResponseForService(
        BLE_SERVICE_UUID,
        BLE_RX_CHARACTERISTIC_UUID,
        base64,
      );
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.stopDemoSimulation();
    try {
      this.notifySubscription?.remove();
      this.notifySubscription = null;
      if (this.device) {
        await this.device.cancelConnection();
        this.device = null;
      }
    } catch {
      // ignore — we're tearing down anyway
    } finally {
      this.setStatus('DISCONNECTED');
    }
  }

  destroy(): void {
    this.stopDemoSimulation();
    try {
      this.manager?.destroy();
    } catch {
      // ignore
    }
    this.manager = null;
    this.statusListeners.clear();
    this.sensorListeners.clear();
  }
}

/** Singleton — one BLE connection per app instance. */
export const BluetoothService = new BluetoothServiceImpl();
