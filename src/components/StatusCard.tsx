import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'info';
  icon?: string;
}

const toneColor = {
  neutral: colors.textPrimary,
  good: colors.accent,
  bad: colors.danger,
  warn: colors.warning,
  info: colors.info,
};

export default function StatusCard({
  label,
  value,
  tone = 'neutral',
  icon,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={[styles.value, { color: toneColor[tone] }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  icon: {
    fontSize: 15,
    marginRight: 6,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  value: {
    fontSize: 16,
    fontWeight: '800',
  },
});