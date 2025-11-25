import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList, Gender } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Compress image
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!nickname.trim()) {
      Alert.alert('エラー', 'ニックネームを入力してください');
      return;
    }
    if (!gender) {
      Alert.alert('エラー', '性別を選択してください');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // In real app, save profile to Supabase here
    // Then navigate to status input
    navigation.replace('StatusInput', { venue_id: 'test_venue' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>PROFILE</Text>
        <Text style={styles.subtitle}>プロフィールを設定してください</Text>

        {/* Photo */}
        <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
              <Text style={styles.photoHint}>タップして写真を選択</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nickname */}
        <Text style={styles.label}>NICKNAME</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="ニックネーム"
          placeholderTextColor={Colors.gray}
          maxLength={20}
        />

        {/* Gender */}
        <Text style={styles.label}>GENDER</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'male' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('male')}
          >
            <Text style={styles.genderIcon}>👨</Text>
            <Text
              style={[
                styles.genderText,
                gender === 'male' && styles.genderTextActive,
              ]}
            >
              MALE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'female' && styles.genderButtonActive,
            ]}
            onPress={() => setGender('female')}
          >
            <Text style={styles.genderIcon}>👩</Text>
            <Text
              style={[
                styles.genderText,
                gender === 'female' && styles.genderTextActive,
              ]}
            >
              FEMALE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!nickname.trim() || !gender) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!nickname.trim() || !gender}
        >
          <Text style={styles.submitButtonText}>NEXT →</Text>
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
    marginBottom: 32,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: Colors.neonLime,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: Colors.darkGray,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoHint: {
    color: Colors.lightGray,
    fontSize: 10,
  },
  label: {
    color: Colors.neonLime,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    color: Colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.darkGray,
    marginBottom: 24,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.darkGray,
  },
  genderButtonActive: {
    borderColor: Colors.neonLime,
  },
  genderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  genderText: {
    color: Colors.lightGray,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  genderTextActive: {
    color: Colors.neonLime,
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
