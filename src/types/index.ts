export * from './SensorData';
export * from './AccidentAnalysis';

export type BluetoothConnectionState = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export type CameraState = 'INACTIVE' | 'REQUESTING_PERMISSION' | 'PERMISSION_DENIED' | 'STARTING' | 'ACTIVE' | 'ERROR';

export interface AccidentEvent {
  id: string;
  analysis: import('./AccidentAnalysis').AccidentAnalysis;
  sensorSnapshot: import('./SensorData').SensorData;
  createdAt: string;
}
