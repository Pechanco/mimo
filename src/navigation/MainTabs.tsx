import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { MainTabParamList } from '../types';
import { Colors } from '../constants/colors';
import TicketScreen from '../screens/TicketScreen';
import FloorScreen from '../screens/FloorScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.neonLime,
        tabBarInactiveTintColor: Colors.gray,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Ticket"
        component={TicketScreen}
        options={{
          tabBarLabel: 'TICKET',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🎫</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Floor"
        component={FloorScreen}
        options={{
          tabBarLabel: 'FLOOR',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🥂</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopColor: Colors.darkGray,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
