import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MONITORING_KEY } from '../config/appConfig';
import { useMonitoring } from '../context/MonitoringContext';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<
  RootStackParamList,
  'MonitoringAccess'
>;

export default function MonitoringAccessScreen() {
  const navigation = useNavigation<Nav>();
  const { startMonitoring } = useMonitoring();

  const [input, setInput] = useState('');
  const [deniedMessage, setDeniedMessage] =
    useState<string | null>(null);

  const handleVerify = async () => {
    Keyboard.dismiss();

    const configured = MONITORING_KEY;

    if (!configured) {
      setDeniedMessage(
        'No monitoring key is configured.',
      );
      return;
    }

    if (input === configured) {
      setDeniedMessage(null);
      setInput('');

      await startMonitoring();

      navigation.replace('Monitoring');
    } else {
      setDeniedMessage(
        'ACCESS DENIED · Invalid monitoring key.',
      );
      setInput('');
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.logoCircle}>
        <Text style={styles.logo}>MD</Text>
      </View>

      <Text style={styles.eyebrow}>
        SECURE MONITORING
      </Text>

      <Text style={styles.title}>
        Monitoring Access
      </Text>

      <Text style={styles.subtitle}>
        Enter the authorized monitoring key to access
        the live accident detection system.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          MONITORING KEY
        </Text>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={text => {
            setInput(text);
            setDeniedMessage(null);
          }}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter access key"
          placeholderTextColor={colors.textMuted}
        />

        {deniedMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {deniedMessage}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            VERIFY & CONTINUE
          </Text>
          <Text style={styles.buttonArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cancel}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        AUTHORIZED ACCESS ONLY
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },

  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(49,215,164,0.10)',
    borderWidth: 1,
    borderColor: colors.accent,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  logo: {
    color: colors.accent,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1,
  },

  eyebrow: {
    color: colors.accent,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 8,
  },

  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '900',
  },

  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
    marginBottom: 25,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
  },

  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },

  input: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  errorBox: {
    backgroundColor: 'rgba(255,89,100,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,89,100,0.25)',
    padding: 9,
    marginTop: 10,
  },

  errorText: {
    color: colors.danger,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '700',
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 13,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginTop: 14,
  },

  buttonText: {
    flex: 1,
    color: colors.background,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  buttonArrow: {
    color: colors.background,
    fontSize: 24,
  },

  cancel: {
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  footer: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 8,
  },
});