import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import MonitoringAccessScreen from '../screens/MonitoringAccessScreen';
import MonitoringScreen from '../screens/MonitoringScreen';
import EventScreen from '../screens/EventScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Home: undefined;
  MonitoringAccess: undefined;
  Monitoring: undefined;
  Events: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },

          headerTintColor: colors.textPrimary,

          headerTitleStyle: {
            fontSize: 15,
            fontWeight: '800',
          },

          headerShadowVisible: false,

          contentStyle: {
            backgroundColor: colors.background,
          },

          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="MonitoringAccess"
          component={MonitoringAccessScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />

        <Stack.Screen
          name="Monitoring"
          component={MonitoringScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Events"
          component={EventScreen}
          options={{
            title: 'EVENT HISTORY',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}