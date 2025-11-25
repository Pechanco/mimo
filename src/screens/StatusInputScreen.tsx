import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList, Mood, PartySize } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StatusInput'>;
type RouteProps = RouteProp<RootStackParamList, 'StatusInput'>;

const MOODS: { id: Mood; icon: string; label: string }[] = [
  { id: 'shot', icon: '🍺', label: 'Shot' },
  { id: 'cocktail', icon: '🍹', label: 'Cocktail' },
  { id: 'champagne', icon: '🍾', label: 'Champagne' },
];

const PARTY_SIZES: { id: PartySize; icon: string; label: string }[] = [
  { id: 'solo', icon: '👤', label: '1人' },
  { id: 'duo', icon: '👥', label: '2人' },
  { id: 'group', icon: '👥', label: '3人以上' },
];

export default function StatusInputScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const [mood, setMood] = useState<Mood | null>(null);
  const [partySize, setPartySize] = useState<PartySize | null>(null);
  const [quickMode, setQuickMode] = useState(false);

  // In real app, get gender from user context
  const userGender: 'male' | 'female' = 'female';

  const handleSubmit = () => {
    if (!mood || !partySize) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // In real app, save check-in to Supabase here
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>STATUS</Text>
        <Text style={styles.subtitle}>今夜のステータスを教えてください</Text>

        {/* Mood Selection */}
        <Text style={styles.sectionLabel}>MOOD</Text>
        <View style={styles.optionRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.optionButton,
                mood === m.id && styles.optionButtonActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setMood(m.id);
              }}
            >
              <Text style={styles.optionIcon}>{m.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  mood === m.id && styles.optionLabelActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Party Size Selection */}
        <Text style={styles.sectionLabel}>PARTY SIZE</Text>
        <View style={styles.optionRow}>
          {PARTY_SIZES.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.optionButton,
                partySize === p.id && styles.optionButtonActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPartySize(p.id);
              }}
            >
              <Text style={styles.optionIcon}>{p.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  partySize === p.id && styles.optionLabelActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Mode (Female only) */}
        {userGender === 'female' && (
          <View style={styles.quickModeContainer}>
            <View style={styles.quickModeInfo}>
              <Text style={styles.quickModeLabel}>⏱️ 5分限定モード</Text>
              <Text style={styles.quickModeDescription}>
                ONにすると、あなたのカードに{'\n'}「5min」タグが表示されます
              </Text>
            </View>
            <Switch
              value={quickMode}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setQuickMode(value);
              }}
              trackColor={{ false: Colors.darkGray, true: Colors.neonLime }}
              thumbColor={Colors.white}
            />
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!mood || !partySize) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!mood || !partySize}
        >
          <Text style={styles.submitButtonText}>CHECK IN →</Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  title: {
    color: Colors.neonLime,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    color: Colors.lightGray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  sectionLabel: {
    color: Colors.neonLime,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.darkGray,
  },
  optionButtonActive: {
    borderColor: Colors.neonLime,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    color: Colors.lightGray,
    fontSize: 12,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: Colors.neonLime,
  },
  quickModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  quickModeInfo: {
    flex: 1,
  },
  quickModeLabel: {
    color: Colors.neonLime,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickModeDescription: {
    color: Colors.lightGray,
    fontSize: 12,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: Colors.neonLime,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 'auto',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.darkGray,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
