import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  PropsWithChildren,
} from 'react';

import { BluetoothService, BleStatus } from '../services/BluetoothService';
import { GeminiService } from '../services/GeminiService';

import {
  SensorData,
  EMPTY_SENSOR_DATA,
  AccidentAnalysis,
  WAITING_ANALYSIS,
  CameraState,
  AccidentEvent,
} from '../types';

interface MonitoringContextValue {
  monitoringActive: boolean;
  bluetoothStatus: BleStatus;
  bluetoothMessage: string | null;
  sensorData: SensorData;
  cameraState: CameraState;
  setCameraState: (s: CameraState) => void;
  aiVerdict: AccidentAnalysis;
  events: AccidentEvent[];
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  submitEvidence: (base64Jpeg: string) => Promise<void>;
  lastError: string | null;
  clearError: () => void;
}

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

export function MonitoringProvider({ children }: PropsWithChildren<{}>) {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] =
    useState<BleStatus>('DISCONNECTED');

  const [bluetoothMessage, setBluetoothMessage] =
    useState<string | null>(null);

  const [sensorData, setSensorData] =
    useState<SensorData>(EMPTY_SENSOR_DATA);

  const [cameraState, setCameraState] =
    useState<CameraState>('INACTIVE');

  const [aiVerdict, setAiVerdict] =
    useState<AccidentAnalysis>(WAITING_ANALYSIS);

  const [events, setEvents] = useState<AccidentEvent[]>([]);

  const [lastError, setLastError] =
    useState<string | null>(null);

  const analyzingRef = useRef(false);

  useEffect(() => {
    const unsubscribeStatus = BluetoothService.onStatusChange(
      (status, message) => {
        setBluetoothStatus(status);
        setBluetoothMessage(message ?? null);

        if (status === 'ERROR' && message) {
          setLastError(message);
        }
      },
    );

    const unsubscribeSensor = BluetoothService.onSensorData(data => {
      // Real ESP32 sensor data arrives here.
      setSensorData(data);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeSensor();
    };
  }, []);

  const startMonitoring = async () => {
    setMonitoringActive(true);

    setSensorData(EMPTY_SENSOR_DATA);
    setAiVerdict(WAITING_ANALYSIS);
    setLastError(null);

    await BluetoothService.connect();
  };

  const stopMonitoring = async () => {
    setMonitoringActive(false);
    setCameraState('INACTIVE');

    await BluetoothService.disconnect();
  };

  const submitEvidence = async (base64Jpeg: string) => {
    // Prevent multiple Gemini requests at the same time.
    if (analyzingRef.current) {
      return;
    }

    analyzingRef.current = true;

    try {
      const result =
        await GeminiService.analyzeEvidence(base64Jpeg);

      if (result.ok && result.analysis) {
        setAiVerdict(result.analysis);

        setEvents(prev => [
          {
            id: `${Date.now()}`,
            analysis: result.analysis as AccidentAnalysis,
            sensorSnapshot: sensorData,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 50));
      } else if (result.error) {
        setLastError(result.error);
      }
    } catch (error) {
      setLastError(
        error instanceof Error
          ? error.message
          : 'AI analysis failed',
      );
    } finally {
      analyzingRef.current = false;
    }
  };

  const value = useMemo<MonitoringContextValue>(
    () => ({
      monitoringActive,
      bluetoothStatus,
      bluetoothMessage,
      sensorData,
      cameraState,
      setCameraState,
      aiVerdict,
      events,
      startMonitoring,
      stopMonitoring,
      submitEvidence,
      lastError,
      clearError: () => setLastError(null),
    }),
    [
      monitoringActive,
      bluetoothStatus,
      bluetoothMessage,
      sensorData,
      cameraState,
      aiVerdict,
      events,
      lastError,
    ],
  );

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring(): MonitoringContextValue {
  const ctx = useContext(MonitoringContext);

  if (!ctx) {
    throw new Error(
      'useMonitoring must be used within MonitoringProvider',
    );
  }

  return ctx;
}