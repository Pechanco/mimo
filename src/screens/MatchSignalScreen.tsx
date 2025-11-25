import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MatchSignal'>;
type RouteProps = RouteProp<RootStackParamList, 'MatchSignal'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const SLIDE_THRESHOLD = SCREEN_WIDTH * 0.6;

export default function MatchSignalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { match, isReceiver } = route.params || { match: null, isReceiver: false };

  // For demo purposes
  const signalNumber = match?.signal_number || 77;
  const meetingPoint = match?.meeting_point || '1F MAIN BAR';
  const amount = 1400;
  const hasQuickMode = true; // Would come from receiver's checkin

  const [isCompleted, setIsCompleted] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing border animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !isReceiver && !isCompleted,
    onMoveShouldSetPanResponder: () => !isReceiver && !isCompleted,
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
          setIsCompleted(true);

          // If quick mode, navigate to timer
          if (hasQuickMode) {
            setTimeout(() => {
              navigation.replace('Timer', { match: match! });
            }, 1000);
          } else {
            // Go back to main after delay
            setTimeout(() => {
              navigation.replace('Main');
            }, 2000);
          }
        });
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  }), [isReceiver, isCompleted, slideAnim, navigation, match, hasQuickMode]);

  return (
    <View style={styles.container}>
      {/* Animated Border */}
      <Animated.View
        style={[
          styles.border,
          { opacity: pulseAnim },
        ]}
      />

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

        {/* Slide Button (Male only) */}
        {!isReceiver && !isCompleted && (
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
              <Text style={styles.slideHint}>スライドして完了</Text>
            </View>
          </View>
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
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: Colors.neonLime,
    margin: 20,
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
    fontVariant: ['tabular-nums'],
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
    fontVariant: ['tabular-nums'],
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
  slideContainer: {
    width: '100%',
    marginTop: 20,
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
