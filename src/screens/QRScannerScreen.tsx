import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'QRScanner'>;

export default function QRScannerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showUnlocked, setShowUnlocked] = useState(false);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    if (data.startsWith('mimo://venue/') || data.includes('mimo')) {
      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowUnlocked(true);

      // Extract venue_id from QR code data
      const venueId = data.replace('mimo://venue/', '') || 'default_venue';

      setTimeout(() => {
        // Navigate to Profile for registration
        // TODO: Check if user already has profile, if yes go to StatusInput
        navigation.replace('Profile');
      }, 2000);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.text}>カメラの許可を確認中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>カメラへのアクセス</Text>
          <Text style={styles.permissionText}>
            QRコードをスキャンするために{'\n'}カメラへのアクセスが必要です
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>許可する</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.header}>
            <Text style={styles.logo}>mimo</Text>
            <Text style={styles.subtitle}>SCAN QR CODE TO ENTER</Text>
          </SafeAreaView>

          <View style={styles.scannerFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>店舗のQRコードをスキャンしてください</Text>
          </View>
        </View>

        {showUnlocked && (
          <View style={styles.unlockedOverlay}>
            <Text style={styles.unlockedIcon}>🔓</Text>
            <Text style={styles.unlockedText}>UNLOCKED</Text>
          </View>
        )}
      </CameraView>

      <TouchableOpacity
        style={styles.devButton}
        onPress={() => handleBarCodeScanned({ type: 'qr', data: 'mimo://venue/test' })}
      >
        <Text style={styles.devButtonText}>DEV: Skip Scan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    color: Colors.neonLime,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  subtitle: {
    color: Colors.white,
    fontSize: 12,
    letterSpacing: 4,
    marginTop: 8,
  },
  scannerFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.neonLime,
  },
  cornerTL: {
    top: '25%',
    left: '15%',
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: '25%',
    right: '15%',
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: '25%',
    left: '15%',
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: '25%',
    right: '15%',
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  footerText: {
    color: Colors.lightGray,
    fontSize: 14,
  },
  unlockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  unlockedText: {
    color: Colors.neonLime,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  permissionTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  permissionText: {
    color: Colors.lightGray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: Colors.neonLime,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
  },
  devButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: Colors.darkGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  devButtonText: {
    color: Colors.lightGray,
    fontSize: 12,
  },
});
