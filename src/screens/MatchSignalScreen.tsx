import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchSignal'>;
type RouteProps = RouteProp<RootStackParamList, 'MatchSignal'>;

export default function MatchSignalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { match, isReceiver } = route.params || { match: null, isReceiver: false };

  // For demo purposes
  const signalNumber = match?.signal_number || 77;
  const meetingPoint = match?.meeting_point || '1F MAIN BAR';
  const amount = 1400;
  const hasQuickMode = true;

  const [isCompleted, setIsCompleted] = useState(false);
  const [borderVisible, setBorderVisible] = useState(true);

  // Strong vibration when match screen appears (critical in loud clubs)
  useEffect(() => {
    // 40 strong vibrations over 6 seconds for maximum attention
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (i % 5 === 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, i * 150);
    }
  }, []);

  // Pulsing border effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBorderVisible(v => !v);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsCompleted(true);

    if (hasQuickMode) {
      setTimeout(() => {
        navigation.replace('Timer', { match: match! });
      }, 1000);
    } else {
      setTimeout(() => {
        navigation.replace('Main');
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Border */}
      <View style={[styles.border, { opacity: borderVisible ? 1 : 0.3 }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Signal Number */}
        <Text style={styles.label}>SIGNAL</Text>
        <Text style={styles.signalNumber}>No. {signalNumber}</Text>

        {/* Meeting Point */}
        <View style={styles.meetingPointContainer}>
          <Text style={styles.meetingPointLabel}>📍 MEET AT</Text>
          <Text style={styles.meetingPoint}>{meetingPoint}</Text>
        </View>

        {/* Amount (Male only) or Gift (Female) */}
        {isReceiver ? (
          <View style={styles.giftContainer}>
            <Text style={styles.giftText}>✨ GIFT ✨</Text>
            <Text style={styles.waitingText}>相手を待っています...</Text>
          </View>
        ) : (
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>PAYMENT</Text>
            <Text style={styles.amount}>¥{amount.toLocaleString()}</Text>
            <Text style={styles.discount}>30% OFF</Text>
          </View>
        )}

        {/* Complete Button (Male only) */}
        {!isReceiver && !isCompleted && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>タップして完了</Text>
          </TouchableOpacity>
        )}

        {/* Completed State */}
        {isCompleted && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>✅ COMPLETED</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  border: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 4,
    borderColor: Colors.neonLime,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  label: {
    color: Colors.lightGray,
    fontSize: 14,
    letterSpacing: 4,
    marginBottom: 8,
  },
  signalNumber: {
    color: Colors.white,
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  meetingPointContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  meetingPointLabel: {
    color: Colors.neonLime,
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 8,
  },
  meetingPoint: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountLabel: {
    color: Colors.lightGray,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  amount: {
    color: Colors.neonLime,
    fontSize: 48,
    fontWeight: 'bold',
  },
  discount: {
    color: Colors.neonLime,
    fontSize: 14,
    marginTop: 4,
  },
  giftContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  giftText: {
    color: Colors.neonLime,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  waitingText: {
    color: Colors.lightGray,
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: Colors.neonLime,
    borderRadius: 30,
    paddingHorizontal: 48,
    paddingVertical: 18,
    marginTop: 20,
  },
  completeButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedContainer: {
    marginTop: 20,
  },
  completedText: {
    color: Colors.neonLime,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});
