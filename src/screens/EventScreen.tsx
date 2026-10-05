import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

import { useMonitoring } from '../context/MonitoringContext';
import { colors } from '../theme/colors';
import { AccidentEvent } from '../types';

function EventRow({ item }: { item: AccidentEvent }) {
  const isAccident =
    item.analysis.verdict === 'ACCIDENT';

  const isSuspicious =
    item.analysis.verdict === 'SUSPICIOUS';

  const accent = isAccident
    ? colors.danger
    : isSuspicious
    ? colors.warning
    : colors.accent;

  return (
    <View
      style={[
        styles.row,
        { borderLeftColor: accent },
      ]}
    >
      <View style={styles.rowHeader}>
        <View>
          <Text
            style={[
              styles.verdict,
              { color: accent },
            ]}
          >
            {item.analysis.verdict.replace(/_/g, ' ')}
          </Text>

          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>

        <View
          style={[
            styles.confidenceBadge,
            { borderColor: accent },
          ]}
        >
          <Text
            style={[
              styles.confidence,
              { color: accent },
            ]}
          >
            {item.analysis.confidence}%
          </Text>
        </View>
      </View>

      <Text style={styles.explanation}>
        {item.analysis.explanation}
      </Text>

      <View style={styles.sensorStrip}>
        <Text style={styles.meta}>
          S1 {item.sensorSnapshot.sonar1 ?? '--'} cm
        </Text>

        <Text style={styles.separator}>·</Text>

        <Text style={styles.meta}>
          S2 {item.sensorSnapshot.sonar2 ?? '--'} cm
        </Text>

        <Text style={styles.separator}>·</Text>

        <Text style={styles.meta}>
          Servo {item.sensorSnapshot.servoAngle ?? '--'}°
        </Text>

        <Text style={styles.separator}>·</Text>

        <Text style={styles.meta}>
          Motion {item.sensorSnapshot.motion ? 'YES' : 'NO'}
        </Text>
      </View>
    </View>
  );
}

export default function EventScreen() {
  const { events } = useMonitoring();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            SYSTEM LOG
          </Text>

          <Text style={styles.title}>
            Event History
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.count}>
            {events.length}
          </Text>
        </View>
      </View>

      {events.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>
              ✓
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            No Events Yet
          </Text>

          <Text style={styles.emptyText}>
            Detected events and AI analysis results
            will appear here during monitoring.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <EventRow item={item} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 10,
            paddingBottom: 25,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  title: {
    color: colors.textPrimary,
    fontSize: 25,
    fontWeight: '900',
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  count: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '900',
  },

  row: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 14,
  },

  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  verdict: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  time: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  confidenceBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  confidence: {
    fontSize: 11,
    fontWeight: '900',
  },

  explanation: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  sensorStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  meta: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
  },

  separator: {
    color: colors.textMuted,
    marginHorizontal: 5,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingBottom: 80,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(49,215,164,0.08)',
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    color: colors.accent,
    fontSize: 25,
    fontWeight: '900',
  },

  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
});