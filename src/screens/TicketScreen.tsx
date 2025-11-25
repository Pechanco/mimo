import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_THRESHOLD = SCREEN_WIDTH * 0.6;

export default function TicketScreen() {
  const [isUsed, setIsUsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Update time every second when ticket is used (anti-screenshot)
  useEffect(() => {
    if (isUsed) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isUsed]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !isUsed,
    onMoveShouldSetPanResponder: () => !isUsed,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        slideAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > SLIDE_THRESHOLD) {
        Animated.spring(slideAnim, {
          toValue: SCREEN_WIDTH - 100,
          useNativeDriver: false,
        }).start(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsUsed(true);
        });
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  }), [isUsed, slideAnim]);

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

          {/* Slide Button */}
          {!isUsed && (
            <View style={styles.slideContainer}>
              <View style={styles.slideTrack}>
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.slideButton,
                    { transform: [{ translateX: slideAnim }] },
                  ]}
                >
                  <Text style={styles.slideButtonText}>→</Text>
                </Animated.View>
                <Text style={styles.slideHint}>スライドして使用</Text>
              </View>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {isUsed
              ? 'バーカウンターでこの画面を見せてください'
              : 'バーでドリンクを受け取る際にスライドしてください'}
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
    fontVariant: ['tabular-nums'],
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
    fontVariant: ['tabular-nums'],
    marginTop: 16,
  },
  slideContainer: {
    marginTop: 24,
  },
  slideTrack: {
    backgroundColor: Colors.darkGray,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  slideButton: {
    position: 'absolute',
    left: 4,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.neonLime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideButtonText: {
    color: Colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
  slideHint: {
    color: Colors.lightGray,
    fontSize: 14,
    textAlign: 'center',
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
