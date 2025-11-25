import React, { useState, useEffect, useRef } from 'react';
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
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

// Slide Button Component
const SlideButton = ({ onSlideComplete, text, disabled }: { onSlideComplete: () => void; text: string; disabled?: boolean }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [sliderWidth, setSliderWidth] = useState(280);
  const thumbWidth = 56;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal movements
        return !disabled && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // Haptic feedback when starting to drag
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabled) return;
        const newValue = Math.max(0, Math.min(gestureState.dx, sliderWidth - thumbWidth));
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabled) return;
        // Lower threshold (0.6) for easier completion
        if (gestureState.dx > (sliderWidth - thumbWidth) * 0.6) {
          Animated.timing(slideAnim, {
            toValue: sliderWidth - thumbWidth,
            duration: 100,
            useNativeDriver: false,
          }).start(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSlideComplete();
            setTimeout(() => slideAnim.setValue(0), 300);
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.slideButtonContainer, disabled && styles.slideButtonDisabled]}
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
    >
      <Text style={styles.slideButtonText}>{text} →→</Text>
      <Animated.View
        style={[styles.slideButtonThumb, { transform: [{ translateX: slideAnim }] }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.slideButtonArrow}>→</Text>
      </Animated.View>
    </View>
  );
};

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
  { id: '1', name: 'TEQUILA SHOT', nameJa: 'テキーラショット', price: 560 },
  { id: '2', name: 'MOJITO', nameJa: 'モヒート', price: 840 },
  { id: '3', name: 'GIN TONIC', nameJa: 'ジントニック', price: 700 },
];

const getMoodLabel = (mood: Mood) => {
  switch (mood) {
    case 'shot': return 'SHOT';
    case 'cocktail': return 'COCKTAIL';
    case 'champagne': return 'CHAMPAGNE';
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<typeof DRINKS[0] | null>(null);
  const [showOfferWarning, setShowOfferWarning] = useState(false);
  const [pendingOffers, setPendingOffers] = useState<string[]>([]);
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [hasSeenWarning, setHasSeenWarning] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Match state
  const [matchSignalNumber, setMatchSignalNumber] = useState(77);
  const [matchDrinkPrice, setMatchDrinkPrice] = useState(0);
  const [matchQuickMode, setMatchQuickMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [hasArrived, setHasArrived] = useState(false);
  const [partnerArrived, setPartnerArrived] = useState(false);

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
            // Multiple vibrations for strong feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 600);
            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 900);
            Alert.alert(
              'TIME UP',
              'お疲れ様でした。\n解散して引き続きお楽しみください。\n\nThank you!\nYou\'re free to go.\nEnjoy the rest of your night!',
              [{ text: 'OK', onPress: () => { setScreen('main'); setTab('ticket'); } }]
            );
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

  const handleOpenUserModal = (user: typeof MOCK_WOMEN[0]) => {
    if (pendingOffers.length >= 3) {
      Alert.alert('制限', '同時に送信できるオファーは3件までです');
      return;
    }
    if (pendingOffers.includes(user.id)) {
      return;
    }
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSelectDrink = (drink: typeof DRINKS[0]) => {
    setSelectedDrink(drink);
    setShowUserModal(false);
    setShowOfferWarning(true);
  };

  const handleConfirmOffer = () => {
    if (!selectedUser || !selectedDrink) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const userQuickMode = selectedUser.quick_mode;
    const drinkPrice = selectedDrink.price;
    setPendingOffers([...pendingOffers, selectedUser.id]);
    setShowOfferWarning(false);
    setSelectedUser(null);
    setSelectedDrink(null);
    // Simulate match after delay
    setTimeout(() => {
      setMatchSignalNumber(Math.floor(Math.random() * 99) + 1);
      setMatchDrinkPrice(drinkPrice);
      setMatchQuickMode(userQuickMode);
      setHasArrived(false);
      setPartnerArrived(false);
      setScreen('matchSignal');
    }, 2000);
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
    // Clear pending offers after match completion
    setPendingOffers([]);
    if (matchQuickMode) {
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
    const handleArrive = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasArrived(true);
      // Simulate partner arriving after delay
      setTimeout(() => {
        setPartnerArrived(true);
      }, 3000);
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.signalBorder} />
        <View style={styles.signalContent}>
          <Text style={styles.signalLabel}>SIGNAL</Text>
          <Text style={styles.signalNumber}>No. {matchSignalNumber}</Text>

          <View style={styles.signalPriceContainer}>
            <Text style={styles.signalPriceLabel}>PAYMENT</Text>
            <Text style={styles.signalPrice}>¥{matchDrinkPrice.toLocaleString()}</Text>
          </View>

          <Text style={styles.signalMeetingLabel}>MEET AT</Text>
          <Text style={styles.signalMeetingPoint}>1F MAIN BAR</Text>
          <Text style={styles.signalMeetingDesc}>1階バーカウンターに集合してください</Text>

          {matchQuickMode && (
            <View style={styles.quickModeBadge}>
              <Text style={styles.quickModeBadgeText}>5分限定モード</Text>
            </View>
          )}

          <View style={styles.arrivalStatus}>
            <View style={styles.arrivalRow}>
              <Text style={styles.arrivalLabel}>あなた</Text>
              <Text style={[styles.arrivalBadge, hasArrived && styles.arrivalBadgeActive]}>
                {hasArrived ? '到着済み' : '移動中'}
              </Text>
            </View>
            <View style={styles.arrivalRow}>
              <Text style={styles.arrivalLabel}>相手</Text>
              <Text style={[styles.arrivalBadge, partnerArrived && styles.arrivalBadgeActive]}>
                {partnerArrived ? '到着済み' : '移動中'}
              </Text>
            </View>
          </View>

          {!hasArrived ? (
            <TouchableOpacity style={styles.signalButton} onPress={handleArrive}>
              <Text style={styles.signalButtonText}>バーに着いた</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.slideButtonWrapperSignal}>
              {partnerArrived ? (
                <SlideButton
                  text="スライドして完了"
                  onSlideComplete={handleMatchComplete}
                />
              ) : (
                <View style={[styles.slideButtonContainer, styles.slideButtonDisabled]}>
                  <Text style={styles.slideButtonText}>相手を待っています...</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {hasArrived && (
          <View style={styles.signalInstructionContainer}>
            <Text style={styles.signalInstructionText}>この画面をバーテンダーが確認したら</Text>
            <Text style={styles.signalInstructionText}>スライドしてください</Text>
          </View>
        )}
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
          <Text style={styles.timerSubLabel}>5-Minute Mode</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              setScreen('main');
              setTab('ticket');
            }}
          >
            <Text style={styles.homeButtonText}>HOME</Text>
          </TouchableOpacity>
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
                <View style={styles.slideButtonWrapper}>
                  <SlideButton
                    text="スライドして使用"
                    onSlideComplete={() => setTicketUsed(true)}
                  />
                </View>
              </>
            )}
          </View>
          <Text style={styles.instructionText}>
            {ticketUsed ? 'バーカウンターでこの画面を見せてください' : 'この画面をバーテンダーが確認したらスライドしてください'}
          </Text>

          <TouchableOpacity style={styles.onlineIndicator} onPress={() => setTab('floor')}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{MOCK_WOMEN.length}人がオンライン</Text>
            <Text style={styles.onlineArrow}>→</Text>
          </TouchableOpacity>
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
                onPress={() => handleOpenUserModal(item)}
                disabled={pendingOffers.includes(item.id)}
              >
                <View style={styles.userPhoto}>
                  <Text style={styles.userPhotoText}>{item.nickname.charAt(0)}</Text>
                </View>
                <Text style={styles.userName}>{item.nickname}</Text>
                <View style={styles.userTags}>
                  <Text style={styles.moodTag}>{getMoodLabel(item.mood)}</Text>
                  <Text style={styles.partyTag}>{getPartySizeLabel(item.party_size)}</Text>
                  {item.quick_mode && <Text style={styles.quickTag}>5min</Text>}
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
        <TouchableOpacity style={[styles.tab, tab === 'ticket' && styles.tabActive]} onPress={() => setTab('ticket')}>
          <Text style={[styles.tabLabel, tab === 'ticket' && styles.tabLabelActive]}>TICKET</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'floor' && styles.tabActive]} onPress={() => setTab('floor')}>
          <Text style={[styles.tabLabel, tab === 'floor' && styles.tabLabelActive]}>FLOOR</Text>
        </TouchableOpacity>
      </View>

      {/* User Detail Modal */}
      <Modal visible={showUserModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.userDetailModal}>
            {selectedUser && (
              <>
                <TouchableOpacity style={styles.modalClose} onPress={() => setShowUserModal(false)}>
                  <Text style={styles.modalCloseText}>×</Text>
                </TouchableOpacity>
                <View style={styles.userDetailPhoto}>
                  <Text style={styles.userDetailPhotoText}>{selectedUser.nickname.charAt(0)}</Text>
                </View>
                <Text style={styles.userDetailName}>{selectedUser.nickname}</Text>
                <View style={styles.userDetailTags}>
                  <Text style={styles.moodTag}>{getMoodLabel(selectedUser.mood)}</Text>
                  <Text style={styles.partyTag}>{getPartySizeLabel(selectedUser.party_size)}</Text>
                  {selectedUser.quick_mode && <Text style={styles.quickTag}>5min</Text>}
                </View>
                <Text style={styles.drinkSelectLabel}>ドリンクを選択</Text>
                <View style={styles.drinkList}>
                  {DRINKS.map(drink => (
                    <TouchableOpacity
                      key={drink.id}
                      style={styles.drinkItem}
                      onPress={() => handleSelectDrink(drink)}
                    >
                      <View style={styles.drinkInfo}>
                        <Text style={styles.drinkName}>{drink.name}</Text>
                        <Text style={styles.drinkNameJa}>{drink.nameJa}</Text>
                      </View>
                      <Text style={styles.drinkPrice}>¥{drink.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Offer Warning Modal */}
      <Modal visible={showOfferWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningTitle}>CONFIRM</Text>
            <Text style={styles.warningText}>
              {selectedUser?.nickname}さんに{'\n'}
              {selectedDrink?.name}を送ります{'\n\n'}
              予想支払額: ¥{selectedDrink?.price}{'\n\n'}
              相手がOKしたら、{'\n'}
              バーカウンターへ向かってください。
            </Text>
            <Text style={styles.warningTextEn}>
              Sending {selectedDrink?.name} to {selectedUser?.nickname}.{'\n'}
              Estimated: ¥{selectedDrink?.price}{'\n\n'}
              If accepted, please head to the bar counter.
            </Text>
            <View style={styles.warningButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowOfferWarning(false);
                  setSelectedDrink(null);
                }}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOffer}>
                <Text style={styles.confirmButtonText}>送信する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Warning Modal */}
      <Modal visible={showWarningModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningTitle}>WAIT</Text>
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
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, backgroundColor: Colors.cardBg, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: Colors.darkGray },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.neonLime, marginRight: 10 },
  onlineText: { color: Colors.white, fontSize: 14, fontWeight: '500' },
  onlineArrow: { color: Colors.neonLime, fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

  // Floor
  floorContainer: { flex: 1 },
  floorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  floorTitle: { color: Colors.white, fontSize: 20, fontWeight: 'bold', letterSpacing: 4 },
  offerCount: { color: Colors.neonLime, fontSize: 12, fontWeight: '600' },
  userGrid: { padding: 10 },
  userCard: { flex: 1, margin: 6, backgroundColor: Colors.cardBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.darkGray, maxWidth: '47%' },
  userPhoto: { width: '100%', aspectRatio: 1, backgroundColor: Colors.darkGray, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  userPhotoText: { fontSize: 36, fontWeight: 'bold', color: Colors.lightGray },
  userName: { color: Colors.white, fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  userTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 },
  moodTag: { color: Colors.neonLime, fontSize: 9, fontWeight: '600', backgroundColor: 'rgba(166, 255, 0, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  partyTag: { color: Colors.lightGray, fontSize: 10, backgroundColor: Colors.darkGray, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  quickTag: { color: Colors.neonLime, fontSize: 10, backgroundColor: 'rgba(166, 255, 0, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  pendingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.neonLime, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  pendingText: { color: Colors.background, fontSize: 10, fontWeight: 'bold' },

  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.darkGray, paddingBottom: 30, paddingTop: 0 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  tabActive: { borderTopWidth: 2, borderTopColor: Colors.neonLime },
  tabLabel: { color: Colors.gray, fontSize: 14, fontWeight: '600', letterSpacing: 2 },
  tabLabelActive: { color: Colors.neonLime },

  // Signal Screen
  signalBorder: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, borderWidth: 4, borderColor: Colors.neonLime, borderRadius: 24 },
  signalContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  signalLabel: { color: Colors.lightGray, fontSize: 14, letterSpacing: 4 },
  signalNumber: { color: Colors.white, fontSize: 56, fontWeight: 'bold', marginBottom: 16 },
  signalPriceContainer: { alignItems: 'center', marginBottom: 20 },
  signalPriceLabel: { color: Colors.lightGray, fontSize: 12, letterSpacing: 2 },
  signalPrice: { color: Colors.neonLime, fontSize: 32, fontWeight: 'bold' },
  signalMeetingLabel: { color: Colors.neonLime, fontSize: 14, letterSpacing: 2 },
  signalMeetingPoint: { color: Colors.white, fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  signalMeetingDesc: { color: Colors.lightGray, fontSize: 14, marginTop: 4, marginBottom: 12 },
  quickModeBadge: { backgroundColor: 'rgba(166, 255, 0, 0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  quickModeBadgeText: { color: Colors.neonLime, fontSize: 14, fontWeight: '600' },
  arrivalStatus: { width: '100%', marginBottom: 16 },
  arrivalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  arrivalLabel: { color: Colors.white, fontSize: 14 },
  arrivalBadge: { color: Colors.lightGray, fontSize: 12, backgroundColor: Colors.darkGray, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  arrivalBadgeActive: { color: Colors.background, backgroundColor: Colors.neonLime },
  signalButton: { backgroundColor: Colors.neonLime, borderRadius: 30, paddingHorizontal: 40, paddingVertical: 16 },
  signalButtonDisabled: { backgroundColor: Colors.darkGray },
  signalButtonText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },
  signalFooterContainer: { position: 'absolute', bottom: 50, left: 40, right: 40, backgroundColor: Colors.neonLime, borderRadius: 12, padding: 16 },
  signalFooterText: { color: Colors.background, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  signalInstructionContainer: { position: 'absolute', bottom: 50, left: 20, right: 20, alignItems: 'center' },
  signalInstructionText: { color: Colors.lightGray, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  // Timer Screen
  timerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerCircle: { width: 250, height: 250, borderRadius: 125, borderWidth: 6, borderColor: Colors.neonLime, justifyContent: 'center', alignItems: 'center' },
  timerText: { color: Colors.neonLime, fontSize: 56, fontWeight: 'bold' },
  timerLabel: { color: Colors.white, fontSize: 18, fontWeight: '600', letterSpacing: 2, marginTop: 40 },
  timerSubLabel: { color: Colors.lightGray, fontSize: 14, letterSpacing: 2, marginTop: 8 },
  homeButton: { marginTop: 40, backgroundColor: Colors.darkGray, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  homeButtonText: { color: Colors.white, fontSize: 14, fontWeight: '600', letterSpacing: 2 },

  // Slide Button
  slideButtonContainer: { width: '100%', height: 56, backgroundColor: Colors.neonLime, borderRadius: 28, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  slideButtonDisabled: { backgroundColor: Colors.darkGray },
  slideButtonText: { color: Colors.background, fontSize: 16, fontWeight: 'bold' },
  slideButtonThumb: { position: 'absolute', left: 4, top: 4, width: 48, height: 48, backgroundColor: Colors.background, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  slideButtonArrow: { color: Colors.neonLime, fontSize: 20, fontWeight: 'bold' },
  slideButtonWrapper: { width: '100%', marginTop: 32 },
  slideButtonWrapperSignal: { width: '100%' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  warningModal: { backgroundColor: Colors.background, margin: 24, borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: Colors.neonLime },
  warningTitle: { color: Colors.neonLime, fontSize: 32, fontWeight: 'bold', letterSpacing: 4, marginBottom: 24, marginTop: 8 },
  warningText: { color: Colors.white, fontSize: 16, textAlign: 'center', lineHeight: 24 },
  warningTextEn: { color: Colors.lightGray, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 16 },
  warningButtons: { flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' },
  cancelButton: { flex: 1, backgroundColor: Colors.darkGray, borderRadius: 12, padding: 16, alignItems: 'center' },
  cancelButtonText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  confirmButton: { flex: 1, backgroundColor: Colors.neonLime, borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmButtonText: { color: Colors.background, fontSize: 14, fontWeight: 'bold' },

  // User Detail Modal
  userDetailModal: { backgroundColor: Colors.background, margin: 24, borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: Colors.neonLime, width: '85%' },
  modalClose: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { color: Colors.lightGray, fontSize: 24 },
  userDetailPhoto: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.darkGray, justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  userDetailPhotoText: { fontSize: 48, fontWeight: 'bold', color: Colors.lightGray },
  userDetailName: { color: Colors.white, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  userDetailTags: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  drinkSelectLabel: { color: Colors.lightGray, fontSize: 14, letterSpacing: 2, marginBottom: 16 },
  drinkList: { width: '100%' },
  drinkItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.darkGray },
  drinkInfo: { flex: 1 },
  drinkName: { color: Colors.white, fontSize: 16, fontWeight: '600' },
  drinkNameJa: { color: Colors.lightGray, fontSize: 12, marginTop: 2 },
  drinkPrice: { color: Colors.neonLime, fontSize: 18, fontWeight: 'bold' },
});
