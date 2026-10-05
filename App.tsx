import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { MonitoringProvider } from './src/context/MonitoringContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <MonitoringProvider>
        <AppNavigator />
      </MonitoringProvider>
    </SafeAreaProvider>
  );
}
