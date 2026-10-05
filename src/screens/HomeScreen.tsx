import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMonitoring } from '../context/MonitoringContext';
import StatusCard from '../components/StatusCard';
import SensorCard from '../components/SensorCard';
import VerdictCard from '../components/VerdictCard';
import { colors } from '../theme/colors';
import { APP_TITLE, APP_SUBTITLE } from '../config/appConfig';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const {
    monitoringActive,
    bluetoothStatus,
    cameraState,
    sensorData,
    aiVerdict,
  } = useMonitoring();

  const systemOnline =
    bluetoothStatus === 'CONNECTED' ||
    cameraState === 'ACTIVE';

  const handlePress = () => {
    if (monitoringActive) {
      navigation.navigate('Monitoring');
    } else {
      navigation.navigate('MonitoringAccess');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brand}>MINI DETECTIVE</Text>
          </View>

          <Text style={styles.title}>
            Smart Accident
          </Text>

          <Text style={styles.titleAccent}>
            Detection System
          </Text>

          <Text style={styles.subtitle}>
            {APP_SUBTITLE}
          </Text>
        </View>

        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              systemOnline && styles.statusDotOnline,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              systemOnline && styles.statusTextOnline,
            ]}
          >
            {systemOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          SYSTEM OVERVIEW
        </Text>

        <Text style={styles.sectionHint}>
          LIVE
        </Text>
      </View>

      <View style={styles.statusGrid}>
        <StatusCard
          icon="●"
          label="System"
          value={
            systemOnline
              ? 'ONLINE'
              : monitoringActive
              ? 'CONNECTING'
              : 'OFFLINE'
          }
          tone={
            systemOnline
              ? 'good'
              : monitoringActive
              ? 'warn'
              : 'neutral'
          }
        />

        <StatusCard
          icon="⌁"
          label="Bluetooth"
          value={
            bluetoothStatus === 'CONNECTED'
              ? 'CONNECTED'
              : bluetoothStatus
          }
          tone={
            bluetoothStatus === 'CONNECTED'
              ? 'good'
              : bluetoothStatus === 'ERROR'
              ? 'bad'
              : 'neutral'
          }
        />

        <StatusCard
          icon="▣"
          label="Camera"
          value={
            cameraState === 'ACTIVE'
              ? 'ACTIVE'
              : cameraState === 'ERROR'
              ? 'ERROR'
              : 'INACTIVE'
          }
          tone={
            cameraState === 'ACTIVE'
              ? 'good'
              : cameraState === 'ERROR'
              ? 'bad'
              : 'neutral'
          }
        />
      </View>

      <SensorCard data={sensorData} />

      <VerdictCard analysis={aiVerdict} />

      <TouchableOpacity
        style={[
          styles.mainButton,
          monitoringActive && styles.mainButtonActive,
        ]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={styles.buttonIcon}>
          <Text style={styles.buttonIconText}>
            {monitoringActive ? '●' : '▶'}
          </Text>
        </View>

        <View style={styles.buttonContent}>
          <Text style={styles.buttonTitle}>
            {monitoringActive
              ? 'MONITORING ACTIVE'
              : 'START MONITORING'}
          </Text>

          <Text style={styles.buttonSubtitle}>
            {monitoringActive
              ? 'Open live monitoring dashboard'
              : 'Connect sensors and begin detection'}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.eventsButton}
        onPress={() => navigation.navigate('Events')}
        activeOpacity={0.8}
      >
        <Text style={styles.eventsIcon}>▤</Text>
        <Text style={styles.eventsText}>
          EVENT HISTORY
        </Text>
        <Text style={styles.eventsArrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        MINI DETECTIVE · SMART SAFETY MONITORING
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 35,
    gap: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 5,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 7,
  },

  brand: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '900',
  },

  titleAccent: {
    color: colors.accent,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '900',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
    maxWidth: 230,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    marginRight: 5,
  },

  statusDotOnline: {
    backgroundColor: colors.accent,
  },

  statusText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  statusTextOnline: {
    color: colors.accent,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionHint: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  statusGrid: {
    flexDirection: 'row',
    gap: 9,
  },

  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 2,
  },

  mainButtonActive: {
    backgroundColor: colors.info,
  },

  buttonIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  buttonIconText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '900',
  },

  buttonContent: {
    flex: 1,
  },

  buttonTitle: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  buttonSubtitle: {
    color: 'rgba(7,11,16,0.65)',
    fontSize: 10,
    marginTop: 3,
  },

  arrow: {
    color: colors.background,
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 6,
  },

  eventsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },

  eventsIcon: {
    color: colors.info,
    fontSize: 17,
    marginRight: 10,
  },

  eventsText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  eventsArrow: {
    color: colors.textSecondary,
    fontSize: 23,
  },

  footer: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 3,
  },
});