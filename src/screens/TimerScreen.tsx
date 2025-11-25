import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Timer'>;
type RouteProps = RouteProp<RootStackParamList, 'Timer'>;

const TIMER_DURATION = 5 * 60; // 5 minutes in seconds

export default function TimerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsFinished(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isFinished) {
      Alert.alert(
        '⏰ TIME UP!',
        '5分が経過しました',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Main'),
          },
        ]
      );
    }
  }, [isFinished]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / TIMER_DURATION;

  return (
    <View style={styles.container}>
      {/* Progress Ring (simplified as border) */}
      <View style={styles.timerContainer}>
        <View
          style={[
            styles.progressRing,
            { borderColor: isFinished ? Colors.error : Colors.neonLime },
          ]}
        >
          <Text
            style={[
              styles.timerText,
              isFinished && styles.timerTextFinished,
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Label */}
      <Text style={styles.label}>
        {isFinished ? 'TIME UP!' : '5分限定モード'}
      </Text>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress * 100}%` },
            isFinished && styles.progressBarFinished,
          ]}
        />
      </View>

      {/* Info */}
      {!isFinished && (
        <Text style={styles.infoText}>
          時間内に楽しい会話を！
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  timerContainer: {
    marginBottom: 40,
  },
  progressRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    color: Colors.neonLime,
    fontSize: 64,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerTextFinished: {
    color: Colors.error,
  },
  label: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 40,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.darkGray,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.neonLime,
  },
  progressBarFinished: {
    backgroundColor: Colors.error,
  },
  infoText: {
    color: Colors.lightGray,
    fontSize: 14,
  },
});
