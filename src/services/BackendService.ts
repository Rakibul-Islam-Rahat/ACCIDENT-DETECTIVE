/**
 * BackendService
 *
 * Placeholder abstraction for the future backend described in the
 * architecture: a server that stores device status/events and pushes
 * live updates to remote (non-monitoring) phones over the internet.
 *
 * No backend exists yet, and this file does not pretend one does — every
 * method here is a documented no-op / local-only stand-in. The point of
 * having it now is that MonitoringContext and screens can be wired
 * against this interface later without another architectural pass:
 * swap the method bodies for real HTTP/WebSocket calls and nothing
 * else in the app needs to change.
 */
import { AccidentEvent, SensorData, AccidentAnalysis, BluetoothConnectionState } from '../types';

export interface RemoteSystemSnapshot {
  online: boolean;
  bluetoothStatus: BluetoothConnectionState;
  sensorData: SensorData;
  aiVerdict: AccidentAnalysis;
  events: AccidentEvent[];
}

class BackendServiceImpl {
  private connected = false;

  /** Would open a WebSocket/poll loop against the real backend. No-op for now. */
  async connect(): Promise<boolean> {
    this.connected = false;
    return false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  /** Would push a status update to the backend so remote phones see it. No-op for now. */
  async publishStatus(_snapshot: RemoteSystemSnapshot): Promise<void> {
    return;
  }

  /** Would push a new accident event to the backend. No-op for now. */
  async publishEvent(_event: AccidentEvent): Promise<void> {
    return;
  }

  /** Would fetch the latest snapshot for a remote (non-monitoring) viewer. Returns null for now. */
  async fetchLatestSnapshot(): Promise<RemoteSystemSnapshot | null> {
    return null;
  }

  disconnect(): void {
    this.connected = false;
  }
}

export const BackendService = new BackendServiceImpl();
