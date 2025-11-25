import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';

import QRScannerScreen from '../screens/QRScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatusInputScreen from '../screens/StatusInputScreen';
import MainTabs from './MainTabs';
import MatchSignalScreen from '../screens/MatchSignalScreen';
import TimerScreen from '../screens/TimerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="QRScanner"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="StatusInput" component={StatusInputScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="MatchSignal"
        component={MatchSignalScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="Timer"
        component={TimerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
