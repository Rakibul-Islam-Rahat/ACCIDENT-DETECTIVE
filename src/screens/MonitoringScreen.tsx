import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

import RNFS from 'react-native-fs';

import { useMonitoring } from '../context/MonitoringContext';

import SensorCard from '../components/SensorCard';
import VerdictCard from '../components/VerdictCard';

import { colors } from '../theme/colors';

import { RootStackParamList } from '../navigation/AppNavigator';

import { AccidentDetectionService } from '../services/AccidentDetectionService';

type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'Monitoring'
>;

export default function MonitoringScreen() {
  const navigation = useNavigation<Nav>();

  const {
    bluetoothStatus,
    sensorData,
    aiVerdict,
    stopMonitoring,
    submitEvidence,
    setCameraState,
    lastError,
    clearError,
  } = useMonitoring();

  const device = useCameraDevice('back');

  const {
    hasPermission,
    requestPermission,
  } = useCameraPermission();

  const cameraRef = useRef<Camera>(null);

  const [permissionChecked, setPermissionChecked] =
    useState(false);

  const [cameraError, setCameraError] =
    useState<string | null>(null);

  const [isCameraLive, setIsCameraLive] =
    useState(false);

  const [appState, setAppState] =
    useState<AppStateStatus>(
      (AppState.currentState ?? 'active') as AppStateStatus,
    );

  /*
   * Prevent multiple camera captures while one capture/
   * Gemini request is already happening.
   */
  const captureInProgressRef = useRef(false);

  /*
   * Request camera permission when Monitoring screen opens.
   */
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!hasPermission) {
        const granted = await requestPermission();

        if (!mounted) {
          return;
        }

        if (!granted) {
          setCameraState('PERMISSION_DENIED');
        }
      }

      if (mounted) {
        setPermissionChecked(true);
      }
    })();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Track whether the app is in the foreground.
   */
  useEffect(() => {
    const sub = AppState.addEventListener(
      'change',
      next => {
        setAppState(next);
      },
    );

    return () => sub.remove();
  }, []);

  const isForeground = appState === 'active';

  const shouldRunCamera =
    permissionChecked &&
    hasPermission &&
    !!device &&
    !cameraError &&
    isForeground;

  /*
   * Update camera state.
   */
  useEffect(() => {
    if (!permissionChecked) {
      return;
    }

    if (!hasPermission) {
      setCameraState('PERMISSION_DENIED');
    } else if (!device) {
      setCameraState('ERROR');
      setCameraError(
        'No rear camera device was found on this phone.',
      );
    } else if (isCameraLive) {
      setCameraState('ACTIVE');
    } else {
      setCameraState('STARTING');
    }
  }, [
    permissionChecked,
    hasPermission,
    device,
    isCameraLive,
    setCameraState,
  ]);

  /*
   * Stop camera state when leaving Monitoring screen.
   */
  useEffect(() => {
    return () => {
      setCameraState('INACTIVE');
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Capture a photo and send it to Gemini.
   */
  const captureAndAnalyze = useCallback(async () => {
    if (captureInProgressRef.current) {
      return;
    }

    if (!cameraRef.current) {
      return;
    }

    if (!isCameraLive) {
      return;
    }

    captureInProgressRef.current = true;

    try {
      console.log(
        '[MINI-DETECTIVE] Event detected. Capturing camera frame...',
      );

      const photo =
        await cameraRef.current.takePhoto({
          flash: 'off',
        });

      console.log(
        '[MINI-DETECTIVE] Photo captured:',
        photo.path,
      );

      const base64 =
        await RNFS.readFile(
          photo.path,
          'base64',
        );

      console.log(
        '[MINI-DETECTIVE] Sending image to Gemini...',
      );

      await submitEvidence(base64);

      console.log(
        '[MINI-DETECTIVE] Gemini analysis completed.',
      );

      /*
       * Delete temporary photo after sending.
       */
      RNFS.unlink(photo.path).catch(() => {});
    } catch (error) {
      console.error(
        '[MINI-DETECTIVE] Camera/AI error:',
        error,
      );

      setCameraError(
        error instanceof Error
          ? error.message
          : 'Failed to capture frame',
      );
    } finally {
      captureInProgressRef.current = false;
    }
  }, [
    isCameraLive,
    submitEvidence,
  ]);

  /*
   * IMPORTANT:
   *
   * Real ESP32 sensor data comes through BluetoothService
   * and reaches sensorData here.
   *
   * AccidentDetectionService checks:
   *
   *   1. Motion detected
   *   2. Large sonar change
   *
   * If either condition is met, we capture a camera frame
   * and send it to Gemini.
   */
  useEffect(() => {
    if (!isCameraLive) {
      return;
    }

    const eventDetected =
      AccidentDetectionService.shouldTriggerAnalysis(
        sensorData,
      );

    if (eventDetected) {
      captureAndAnalyze();
    }
  }, [
    sensorData,
    isCameraLive,
    captureAndAnalyze,
  ]);

  /*
   * Reset the accident detector whenever this screen
   * becomes active.
   */
  useEffect(() => {
    AccidentDetectionService.reset();
  }, []);

  const handleStop = async () => {
    await stopMonitoring();

    navigation.navigate('Home');
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            MINI DETECTIVE
          </Text>

          <Text style={styles.subtitle}>
            SMART ACCIDENT MONITORING
          </Text>
        </View>

        <Text style={styles.activeBadge}>
          ● LIVE
        </Text>
      </View>

      {/* CAMERA */}
      <View style={styles.cameraBox}>
        {!permissionChecked && (
          <Text style={styles.cameraMsg}>
            Requesting camera permission...
          </Text>
        )}

        {permissionChecked && !hasPermission && (
          <Text style={styles.cameraMsg}>
            Camera permission denied.
            {'\n'}
            Enable camera permission in phone Settings.
          </Text>
        )}

        {permissionChecked &&
          hasPermission &&
          !device && (
            <Text style={styles.cameraMsg}>
              No rear camera detected on this device.
            </Text>
          )}

        {cameraError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              CAMERA ERROR
            </Text>

            <Text style={styles.errorMsg}>
              {cameraError}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setCameraError(null);
                setIsCameraLive(false);
              }}
            >
              <Text style={styles.retryText}>
                RETRY
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {shouldRunCamera && !cameraError && (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={shouldRunCamera}
            photo={true}
            onInitialized={() => {
              console.log(
                '[MINI-DETECTIVE] Camera initialized.',
              );

              setIsCameraLive(true);
              setCameraState('ACTIVE');
            }}
            onError={error => {
              console.error(
                '[MINI-DETECTIVE] Camera error:',
                error,
              );

              setIsCameraLive(false);

              setCameraError(
                error.message ??
                  'Unknown camera error',
              );
            }}
          />
        )}

        {/* CAMERA STATUS OVERLAY */}
        {isCameraLive && !cameraError && (
          <View style={styles.cameraLiveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.cameraLiveText}>
              CAMERA LIVE
            </Text>
          </View>
        )}
      </View>

      {/* BLUETOOTH STATUS */}
      <View style={styles.connectionCard}>
        <View style={styles.connectionLeft}>
          <View
            style={[
              styles.statusDot,
              bluetoothStatus === 'CONNECTED'
                ? styles.statusConnected
                : styles.statusDisconnected,
            ]}
          />

          <View>
            <Text style={styles.connectionLabel}>
              ESP32 CONNECTION
            </Text>

            <Text style={styles.connectionValue}>
              {bluetoothStatus}
            </Text>
          </View>
        </View>
      </View>

      {/* SENSOR DATA */}
      <SensorCard data={sensorData} />

      {/* AI VERDICT */}
      <VerdictCard analysis={aiVerdict} />

      {/* ERROR */}
      {lastError && (
        <TouchableOpacity
          onPress={clearError}
          style={styles.errorBanner}
        >
          <Text style={styles.errorBannerText}>
            {lastError}
          </Text>

          <Text style={styles.dismissText}>
            Tap to dismiss
          </Text>
        </TouchableOpacity>
      )}

      {/* STOP */}
      <TouchableOpacity
        style={styles.stopButton}
        onPress={handleStop}
        activeOpacity={0.85}
      >
        <Text style={styles.stopText}>
          STOP MONITORING
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },

  activeBadge: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  cameraBox: {
    height: 260,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraMsg: {
    color: colors.textSecondary,
    padding: 16,
    textAlign: 'center',
    lineHeight: 20,
  },

  cameraLiveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: colors.accent,
    marginRight: 6,
  },

  cameraLiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  errorBox: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },

  errorTitle: {
    color: colors.danger,
    fontWeight: '800',
    letterSpacing: 1,
  },

  errorMsg: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
  },

  retryButton: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },

  retryText: {
    color: '#210000',
    fontWeight: '800',
  },

  connectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },

  connectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  statusConnected: {
    backgroundColor: colors.accent,
  },

  statusDisconnected: {
    backgroundColor: colors.danger,
  },

  connectionLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  connectionValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },

  errorBanner: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.warning,
  },

  errorBannerText: {
    color: colors.warning,
    fontSize: 12,
  },

  dismissText: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  stopButton: {
    backgroundColor: colors.danger,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 'auto',
  },

  stopText: {
    color: '#210000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});