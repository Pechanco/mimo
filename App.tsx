import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// Types
type Screen = 'qr' | 'profile' | 'status' | 'main' | 'matchSignal' | 'timer';
type Tab = 'ticket' | 'floor';
type Gender = 'male' | 'female';
type Mood = 'shot' | 'cocktail' | 'champagne';
type PartySize = 'solo' | 'duo' | 'group';

// Colors
const Colors = {
  background: '#000000',
  white: '#FFFFFF',
  neonLime: '#A6FF00',
  gray: '#666666',
  darkGray: '#333333',
  lightGray: '#999999',
  cardBg: 'rgba(255, 255, 255, 0.05)',
};

// Mock data
const MOCK_WOMEN = [
  { id: '1', nickname: 'Mika', mood: 'cocktail' as Mood, party_size: 'duo' as PartySize, quick_mode: true },
  { id: '2', nickname: 'Yuki', mood: 'champagne' as Mood, party_size: 'solo' as PartySize, quick_mode: false },
  { id: '3', nickname: 'Rina', mood: 'shot' as Mood, party_size: 'group' as PartySize, quick_mode: false },
  { id: '4', nickname: 'Saki', mood: 'cocktail' as Mood, party_size: 'duo' as PartySize, quick_mode: true },
];

const MOCK_OFFERS = [
  { id: '1', senderName: 'Ken', item: 'TEQUILA SHOT', quantity: 2, meetingPoint: '1F MAIN BAR' },
  { id: '2', senderName: 'Taro', item: 'MOJITO', quantity: 1, meetingPoint: '2F LOUNGE' },
];

const DRINKS = [
  { id: '1', name: 'TEQUILA SHOT', price: 560 },
  { id: '2', name: 'MOJITO', price: 840 },
  { id: '3', name: 'GIN TONIC', price: 700 },
];

const getMoodIcon = (mood: Mood) => {
  switch (mood) {
    case 'shot': return '🍺';
    case 'cocktail': return '🍹';
    case 'champagne': return '🍾';
  }
};

const getPartySizeLabel = (size: PartySize) => {
  switch (size) {
    case 'solo': return 'SOLO';
    case 'duo': return 'DUO';
    case 'group': return 'GROUP';
  }
};

export default function App() {
  // Navigation state
  const [screen, setScreen] = useState<Screen>('qr');
  const [tab, setTab] = useState<Tab>('ticket');

  // User state
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [partySize, setPartySize] = useState<PartySize | null>(null);
  const [quickMode, setQuickMode] = useState(false);

  // Ticket state
  const [ticketUsed, setTicketUsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Floor state
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_WOMEN[0] | null>(null);
  const [pendingOffers, setPendingOffers] = useState<string[]>([]);
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [hasSeenWarning, setHasSeenWarning] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Match state
  const [matchSignalNumber, setMatchSignalNumber] = useState(77);
  const [timerSeconds, setTimerSeconds] = useState(300);

  // Update time for used ticket
  useEffect(() => {
    if (ticketUsed) {
      const interval = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(interval);
    }
  }, [ticketUsed]);

  // Timer countdown
  useEffect(() => {
    if (screen === 'timer' && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('⏰ TIME UP!', '5分が経過しました', [
              { text: 'OK', onPress: () => { setScreen('main'); setTab('ticket'); } }
            ]);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [screen, timerSeconds]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleQRScan = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Skip profile for demo, go directly to main
    setScreen('main');
  };

  const handleSendOffer = (user: typeof MOCK_WOMEN[0]) => {
    if (pendingOffers.length >= 3) {
      Alert.alert('制限', '同時に送信できるオファーは3件までです');
      return;
    }
    Alert.alert(
      'CONFIRM OFFER',
      `送る相手: ${user.nickname}\n内容: ${DRINKS[0].name} x 1\n予想支払額: ¥${DRINKS[0].price}\n\n⚠️ 相手がOKしたら、バーカウンターへ向かってください。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '送信',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPendingOffers([...pendingOffers, user.id]);
            setSelectedUser(null);
            // Simulate match after delay
            setTimeout(() => {
              setMatchSignalNumber(Math.floor(Math.random() * 99) + 1);
              setScreen('matchSignal');
            }, 2000);
          },
        },
      ]
    );
  };

  const handleAcceptOffer = (offerId: string) => {
    if (!hasSeenWarning) {
      setShowWarningModal(true);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOffers(offers.filter(o => o.id !== offerId));
    setMatchSignalNumber(Math.floor(Math.random() * 99) + 1);
    setScreen('matchSignal');
  };

  const handleMatchComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (quickMode) {
      setTimerSeconds(300);
      setScreen('timer');
    } else {
      setScreen('main');
      setTab('ticket');
    }
  };

  // QR Scanner Screen
  if (screen === 'qr') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.qrContent}>
          <Text style={styles.logo}>mimo</Text>
          <Text style={styles.qrSubtitle}>SCAN QR CODE TO ENTER</Text>
          <View style={styles.qrFrame}>
            <View style={[styles.qrCorner, styles.qrCornerTL]} />
            <View style={[styles.qrCorner, styles.qrCornerTR]} />
            <View style={[styles.qrCorner, styles.qrCornerBL]} />
            <View style={[styles.qrCorner, styles.qrCornerBR]} />
          </View>
          <TouchableOpacity style={styles.devButton} onPress={handleQRScan}>
            <Text style={styles.devButtonText}>DEV: Skip Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Match Signal Screen
  if (screen === 'matchSignal') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.signalBorder} />
        <View style={styles.signalContent}>
          <Text style={styles.signalLabel}>SIGNAL</Text>
          <Text style={styles.signalNumber}>No. {matchSignalNumber}</Text>
          <Text style={styles.signalMeetingLabel}>📍 MEET AT</Text>
          <Text style={styles.signalMeetingPoint}>1F MAIN BAR</Text>
          <View style={styles.signalAmountContainer}>
            <Text style={styles.signalAmountLabel}>PAYMENT</Text>
            <Text style={styles.signalAmount}>¥1,400</Text>
            <Text style={styles.signalDiscount}>30% OFF</Text>
          </View>
          <TouchableOpacity style={styles.signalButton} onPress={handleMatchComplete}>
            <Text style={styles.signalButtonText}>タップして完了</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Timer Screen
  if (screen === 'timer') {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.timerContent}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>
              {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
            </Text>
          </View>
          <Text style={styles.timerLabel}>5分限定モード</Text>
        </View>
      </View>
    );
  }

  // Main Screen with Tabs
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>mimo</Text>
      </View>

      {/* Content */}
      {tab === 'ticket' ? (
        <View style={styles.content}>
          <View style={[styles.ticketCard, ticketUsed && styles.ticketCardUsed]}>
            <Text style={styles.venueName}>CLUB NAGOYA</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('ja-JP')}</Text>
            {ticketUsed ? (
              <>
                <Text style={styles.usedText}>USED</Text>
                <Text style={styles.timeText}>{currentTime.toLocaleTimeString('ja-JP')}</Text>
              </>
            ) : (
              <>
                <Text style={styles.freeText}>1</Text>
                <Text style={styles.drinkText}>FREE DRINK</Text>
                <TouchableOpacity
                  style={styles.useButton}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setTicketUsed(true);
                  }}
                >
                  <Text style={styles.useButtonText}>タップして使用</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <Text style={styles.instructionText}>
            {ticketUsed ? 'バーカウンターでこの画面を見せてください' : 'バーでドリンクを受け取る際にタップしてください'}
          </Text>
        </View>
      ) : (
        // Floor Screen (Male View for demo)
        <View style={styles.floorContainer}>
          <View style={styles.floorHeader}>
            <Text style={styles.floorTitle}>FLOOR</Text>
            <Text style={styles.offerCount}>{pendingOffers.length}/3 オファー中</Text>
          </View>
          <FlatList
            data={MOCK_WOMEN}
            numColumns={2}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.userGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => handleSendOffer(item)}
                disabled={pendingOffers.includes(item.id)}
              >
                <View style={styles.userPhoto}>
                  <Text style={styles.userPhotoText}>👤</Text>
                </View>
                <Text style={styles.userName}>{item.nickname}</Text>
                <View style={styles.userTags}>
                  <Text style={styles.moodTag}>{getMoodIcon(item.mood)}</Text>
                  <Text style={styles.partyTag}>{getPartySizeLabel(item.party_size)}</Text>
                  {item.quick_mode && <Text style={styles.quickTag}>⏱️ 5min</Text>}
                </View>
                {pendingOffers.includes(item.id) && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>送信中</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => setTab('ticket')}>
          <Text style={styles.tabIcon}>🎫</Text>
          <Text style={[styles.tabLabel, tab === 'ticket' && styles.tabLabelActive]}>TICKET</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setTab('floor')}>
          <Text style={styles.tabIcon}>🥂</Text>
          <Text style={[styles.tabLabel, tab === 'floor' && styles.tabLabelActive]}>FLOOR</Text>
        </TouchableOpacity>
      </View>

      {/* Warning Modal */}
      <Modal visible={showWarningModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>WAIT!</Text>
            <Text style={styles.warningText}>
              mimoの「CHEERS」は「いいね」ではありません。{'\n\n'}
              「今すぐバーで合流する」という約束です。{'\n\n'}
              準備はいいですか？
            </Text>
            <View style={styles.warningButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowWarningModal(false)}>
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setHasSeenWarning(true);
                  setShowWarningModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>理解して合流する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: { paddingTop: 60, paddingBottom: 16, alignItems: 'center' },
  headerLogo: { color: Colors.neonLime, fontSize: 24, fontWeight: 'bold', letterSpacing: 4 },

  // QR Screen
  qrContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { color: Colors.neonLime, fontSize: 48, fontWeight: 'bold', letterSpacing: 8 },
  qrSubtitle: { color: Colors.white, fontSize: 12, letterSpacing: 4, marginTop: 8, marginBottom: 60 },
  qrFrame: { width: 250, height: 250, position: 'relative' },
  qrCorner: { position: 'absolute', width: 40, height: 40, borderColor: Colors.neonLime },
  qrCornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  qrCornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  qrCornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  qrCornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  devButton: { marginTop: 60, backgroundColor: Colors.darkGray, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  devButtonText: { color: Colors.lightGray, fontSize: 12 },

  // Ticket
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  ticketCard: { backgroundColor: Colors.cardBg, borderRadius: 20, borderWidth: 2, borderColor: Colors.neonLime, padding: 24, alignItems: 'center' },
  ticketCardUsed: { borderColor: Colors.gray },
  venueName: { color: Colors.white, fontSize: 18, fontWeight: '600', letterSpacing: 2 },
  dateText: { color: Colors.lightGray, fontSize: 14, marginTop: 4, marginBottom: 24 },
  freeText: { color: Colors.neonLime, fontSize: 100, fontWeight: 'bold' },
  drinkText: { color: Colors.white, fontSize: 28, fontWeight: '700', letterSpacing: 4 },
  usedText: { color: Colors.gray, fontSize: 48, fontWeight: 'bold', letterSpacing: 8, marginTop: 20 },
  timeText: { color: Colors.neonLime, fontSize: 36, fontWeight: 'bold', marginTop: 16 },
  useButton: { backgroundColor: Colors.neonLime, borderRadius: 30, paddingHorizontal: 48, paddingVertical: 18, marginTop: 32 },
  useButtonText: { color: Colors.background, fontSize: 18, fontWeight: 'bold' },
  instructionText: { color: Colors.lightGray, fontSize: 14, textAlign: 'center', marginTop: 24 },

  // Floor
  floorContainer: { flex: 1 },
  floorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  floorTitle: { color: Colors.white, fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  offerCount: { color: Colors.neonLime, fontSize: 12, fontWeight: '600' },
  userGrid: { padding: 10 },
  userCard: { flex: 1, margin: 6, backgroundColor: Colors.cardBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.darkGray, maxWidth: '47%' },
  userPhoto: { width: '100%', aspectRatio: 1, backgroundColor: Colors.darkGray, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  userPhotoText: { fontSize: 40 },
  userName: { color: Colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  userTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 },
  moodTag: { fontSize: 14 },
  partyTag: { color: Colors.lightGray, fontSize: 10, backgroundColor: Colors.darkGray, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  quickTag: { color: Colors.neonLime, fontSize: 10, backgroundColor: 'rgba(166, 255, 0, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pendingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.neonLime, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  pendingText: { color: Colors.background, fontSize: 10, fontWeight: 'bold' },

  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.darkGray, paddingBottom: 30, paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 24 },
  tabLabel: { color: Colors.gray, fontSize: 12, fontWeight: '600', marginTop: 4 },
  tabLabelActive: { color: Colors.neonLime },

  // Signal Screen
  signalBorder: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, borderWidth: 4, borderColor: Colors.neonLime, borderRadius: 24 },
  signalContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  signalLabel: { color: Colors.lightGray, fontSize: 14, letterSpacing: 4 },
  signalNumber: { color: Colors.white, fontSize: 64, fontWeight: 'bold', marginBottom: 40 },
  signalMeetingLabel: { color: Colors.neonLime, fontSize: 14, letterSpacing: 2 },
  signalMeetingPoint: { color: Colors.white, fontSize: 24, fontWeight: 'bold', letterSpacing: 2, marginBottom: 40 },
  signalAmountContainer: { alignItems: 'center', marginBottom: 40 },
  signalAmountLabel: { color: Colors.lightGray, fontSize: 12, letterSpacing: 2 },
  signalAmount: { color: Colors.neonLime, fontSize: 40, fontWeight: 'bold' },
  signalDiscount: { color: Colors.neonLime, fontSize: 14, marginTop: 4 },
  signalButton: { backgroundColor: Colors.neonLime, borderRadius: 30, paddingHorizontal: 48, paddingVertical: 18 },
  signalButtonText: { color: Colors.background, fontSize: 18, fontWeight: 'bold' },

  // Timer Screen
  timerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerCircle: { width: 250, height: 250, borderRadius: 125, borderWidth: 6, borderColor: Colors.neonLime, justifyContent: 'center', alignItems: 'center' },
  timerText: { color: Colors.neonLime, fontSize: 56, fontWeight: 'bold' },
  timerLabel: { color: Colors.white, fontSize: 18, fontWeight: '600', letterSpacing: 2, marginTop: 40 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  warningModal: { backgroundColor: Colors.background, margin: 24, borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: Colors.neonLime },
  warningIcon: { fontSize: 48, marginBottom: 16 },
  warningTitle: { color: Colors.neonLime, fontSize: 32, fontWeight: 'bold', letterSpacing: 4, marginBottom: 24 },
  warningText: { color: Colors.white, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  warningButtons: { flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' },
  cancelButton: { flex: 1, backgroundColor: Colors.darkGray, borderRadius: 12, padding: 16, alignItems: 'center' },
  cancelButtonText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  confirmButton: { flex: 1, backgroundColor: Colors.neonLime, borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmButtonText: { color: Colors.background, fontSize: 14, fontWeight: 'bold' },
});
