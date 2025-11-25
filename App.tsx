import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// Simple app without navigation to test if basic rendering works
export default function App() {
  const [screen, setScreen] = useState<'ticket' | 'floor'>('ticket');
  const [ticketUsed, setTicketUsed] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>mimo</Text>
      </View>

      {/* Content */}
      {screen === 'ticket' ? (
        <View style={styles.content}>
          <View style={[styles.ticketCard, ticketUsed && styles.ticketCardUsed]}>
            <Text style={styles.venueName}>CLUB NAGOYA</Text>
            {ticketUsed ? (
              <>
                <Text style={styles.usedText}>USED</Text>
                <Text style={styles.timeText}>{new Date().toLocaleTimeString()}</Text>
              </>
            ) : (
              <>
                <Text style={styles.freeText}>1</Text>
                <Text style={styles.drinkText}>FREE DRINK</Text>
              </>
            )}
            {!ticketUsed && (
              <TouchableOpacity
                style={styles.useButton}
                onPress={() => setTicketUsed(true)}
              >
                <Text style={styles.useButtonText}>タップして使用</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Text style={styles.floorTitle}>FLOOR</Text>
          <Text style={styles.floorSubtitle}>Coming soon...</Text>
        </ScrollView>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setScreen('ticket')}
        >
          <Text style={styles.tabIcon}>🎫</Text>
          <Text style={[styles.tabLabel, screen === 'ticket' && styles.tabLabelActive]}>
            TICKET
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setScreen('floor')}
        >
          <Text style={styles.tabIcon}>🥂</Text>
          <Text style={[styles.tabLabel, screen === 'floor' && styles.tabLabelActive]}>
            FLOOR
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    color: '#A6FF00',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  ticketCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#A6FF00',
    padding: 24,
    alignItems: 'center',
  },
  ticketCardUsed: {
    borderColor: '#666666',
  },
  venueName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 32,
  },
  freeText: {
    color: '#A6FF00',
    fontSize: 120,
    fontWeight: 'bold',
  },
  drinkText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
  },
  usedText: {
    color: '#666666',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  timeText: {
    color: '#A6FF00',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
  },
  useButton: {
    backgroundColor: '#A6FF00',
    borderRadius: 30,
    paddingHorizontal: 48,
    paddingVertical: 18,
    marginTop: 32,
  },
  useButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  floorTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 40,
  },
  floorSubtitle: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingBottom: 30,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabLabel: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#A6FF00',
  },
});
