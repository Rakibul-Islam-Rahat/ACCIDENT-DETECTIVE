import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusCard from './StatusCard';
import { SensorData } from '../types';
import { getDirectionFromAngle } from '../utils/direction';
import { colors } from '../theme/colors';

export default function SensorCard({ data }: { data: SensorData }) {
  const direction =
    data.servoAngle !== null
      ? getDirectionFromAngle(data.servoAngle)
      : '--';

  const motionDetected = data.motion === true;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>LIVE SENSOR DATA</Text>
          <Text style={styles.sectionSubtitle}>
            Real-time hardware telemetry
          </Text>
        </View>

        <View
          style={[
            styles.liveBadge,
            motionDetected && styles.liveBadgeWarning,
          ]}
        >
          <View
            style={[
              styles.liveDot,
              motionDetected && styles.liveDotWarning,
            ]}
          />
          <Text
            style={[
              styles.liveText,
              motionDetected && styles.liveTextWarning,
            ]}
          >
            {motionDetected ? 'ALERT' : 'LIVE'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <StatusCard
          icon="↻"
          label="Servo Angle"
          value={
            data.servoAngle !== null
              ? `${data.servoAngle}°`
              : '--'
          }
          tone="info"
        />

        <StatusCard
          icon="◈"
          label="Direction"
          value={direction}
          tone="neutral"
        />

        <StatusCard
          icon="⌁"
          label="Sonar 1"
          value={
            data.sonar1 !== null
              ? `${data.sonar1} cm`
              : '--'
          }
          tone="good"
        />

        <StatusCard
          icon="⌁"
          label="Sonar 2"
          value={
            data.sonar2 !== null
              ? `${data.sonar2} cm`
              : '--'
          }
          tone="good"
        />

        <View
          style={[
            styles.motionCard,
            motionDetected && styles.motionCardDanger,
          ]}
        >
          <Text style={styles.motionLabel}>MOTION</Text>

          <View style={styles.motionRow}>
            <View
              style={[
                styles.motionIndicator,
                motionDetected && styles.motionIndicatorDanger,
              ]}
            />

            <Text
              style={[
                styles.motionValue,
                motionDetected && styles.motionValueDanger,
              ]}
            >
              {data.motion === null
                ? 'WAITING'
                : motionDetected
                ? 'DETECTED'
                : 'NORMAL'}
            </Text>
          </View>
        </View>
      </View>

      {data.isDemoData && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            DEMO MODE · SIMULATED SENSOR DATA
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(49,215,164,0.10)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  liveBadgeWarning: {
    backgroundColor: 'rgba(255,89,100,0.12)',
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 5,
  },

  liveDotWarning: {
    backgroundColor: colors.danger,
  },

  liveText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  liveTextWarning: {
    color: colors.danger,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  motionCard: {
    width: '100%',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
  },

  motionCardDanger: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255,89,100,0.08)',
  },

  motionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 7,
  },

  motionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  motionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginRight: 8,
  },

  motionIndicatorDanger: {
    backgroundColor: colors.danger,
  },

  motionValue: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  motionValueDanger: {
    color: colors.danger,
  },

  demoBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(255,200,87,0.08)',
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },

  demoText: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});