import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { AccidentAnalysis } from '../types';

const verdictTone: Record<AccidentAnalysis['verdict'], string> = {
  WAITING_FOR_EVENT: colors.textSecondary,
  NO_ACCIDENT: colors.accent,
  SUSPICIOUS: colors.warning,
  ACCIDENT: colors.danger,
};

const verdictLabel: Record<AccidentAnalysis['verdict'], string> = {
  WAITING_FOR_EVENT: 'WAITING FOR EVENT',
  NO_ACCIDENT: 'NO ACCIDENT',
  SUSPICIOUS: 'SUSPICIOUS EVENT',
  ACCIDENT: 'ACCIDENT DETECTED',
};

const verdictIcon: Record<AccidentAnalysis['verdict'], string> = {
  WAITING_FOR_EVENT: '◌',
  NO_ACCIDENT: '✓',
  SUSPICIOUS: '!',
  ACCIDENT: '!',
};

export default function VerdictCard({
  analysis,
}: {
  analysis: AccidentAnalysis;
}) {
  const tone = verdictTone[analysis.verdict];

  return (
    <View
      style={[
        styles.card,
        analysis.verdict === 'ACCIDENT' && styles.accidentCard,
        analysis.verdict === 'SUSPICIOUS' && styles.suspiciousCard,
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>AI ANALYSIS</Text>
          <Text style={styles.subheading}>
            Gemini-powered visual assessment
          </Text>
        </View>

        <View
          style={[
            styles.iconCircle,
            { borderColor: tone },
          ]}
        >
          <Text style={[styles.icon, { color: tone }]}>
            {verdictIcon[analysis.verdict]}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={[styles.verdict, { color: tone }]}>
        {verdictLabel[analysis.verdict]}
      </Text>

      {analysis.verdict !== 'WAITING_FOR_EVENT' ? (
        <>
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>
              CONFIDENCE
            </Text>

            <Text style={[styles.confidence, { color: tone }]}>
              {analysis.confidence}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progress,
                {
                  width: `${Math.max(
                    0,
                    Math.min(100, analysis.confidence),
                  )}%`,
                  backgroundColor: tone,
                },
              ]}
            />
          </View>

          <Text style={styles.explanation}>
            {analysis.explanation}
          </Text>

          <Text style={styles.caveat}>
            AI analysis is a prototype aid and is not a
            certified determination.
          </Text>
        </>
      ) : (
        <Text style={styles.waitingText}>
          Monitoring sensors are active. AI analysis will
          appear when an event requires investigation.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },

  accidentCard: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255,89,100,0.06)',
  },

  suspiciousCard: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(255,200,87,0.05)',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heading: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subheading: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 18,
    fontWeight: '900',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 15,
  },

  verdict: {
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  confidenceLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  confidence: {
    fontSize: 16,
    fontWeight: '900',
  },

  progressBackground: {
    height: 5,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 7,
  },

  progress: {
    height: '100%',
    borderRadius: 3,
  },

  explanation: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 15,
  },

  waitingText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },

  caveat: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    fontStyle: 'italic',
    marginTop: 12,
  },
});