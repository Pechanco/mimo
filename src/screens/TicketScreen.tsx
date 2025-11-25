import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TicketScreen() {
  const [isUsed, setIsUsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second when ticket is used (anti-screenshot)
  useEffect(() => {
    if (isUsed) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isUsed]);

  const handleUseTicket = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsUsed(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Ticket Card */}
        <View style={[styles.ticketCard, isUsed && styles.ticketCardUsed]}>
          {/* Header */}
          <View style={styles.ticketHeader}>
            <Text style={styles.venueName}>CLUB NAGOYA</Text>
            <Text style={styles.date}>{formatDate(new Date())}</Text>
          </View>

          {/* Main Content */}
          <View style={styles.ticketMain}>
            {isUsed ? (
              <>
                <Text style={styles.usedText}>USED</Text>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              </>
            ) : (
              <>
                <Text style={styles.freeText}>1</Text>
                <Text style={styles.drinkText}>FREE DRINK</Text>
              </>
            )}
          </View>

          {/* Use Button */}
          {!isUsed && (
            <TouchableOpacity style={styles.useButton} onPress={handleUseTicket}>
              <Text style={styles.useButtonText}>タップして使用</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {isUsed
              ? 'バーカウンターでこの画面を見せてください'
              : 'バーでドリンクを受け取る際にタップしてください'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  ticketCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.neonLime,
    padding: 24,
    marginBottom: 24,
  },
  ticketCardUsed: {
    borderColor: Colors.gray,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  venueName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  date: {
    color: Colors.lightGray,
    fontSize: 14,
    marginTop: 4,
  },
  ticketMain: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  freeText: {
    color: Colors.neonLime,
    fontSize: 120,
    fontWeight: 'bold',
  },
  drinkText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
  },
  usedText: {
    color: Colors.gray,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  timeText: {
    color: Colors.neonLime,
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 16,
  },
  useButton: {
    backgroundColor: Colors.neonLime,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  useButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    alignItems: 'center',
  },
  instructionText: {
    color: Colors.lightGray,
    fontSize: 14,
    textAlign: 'center',
  },
});
