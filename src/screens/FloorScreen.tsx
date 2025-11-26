import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { FloorUser, Offer, Mood, PartySize, RootStackParamList } from '../types';
import { getDrinks, getVenue, DrinkItem } from '../services/database';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Fallback mock data (used when DB is not available)
const MOCK_WOMEN: FloorUser[] = [
  { id: '1', nickname: 'Mika', photo_url: null, mood: 'cocktail', party_size: 'duo', quick_mode: true, age: 24 },
  { id: '2', nickname: 'Yuki', photo_url: null, mood: 'champagne', party_size: 'solo', quick_mode: false, age: 22 },
  { id: '3', nickname: 'Rina', photo_url: null, mood: 'shot', party_size: 'group', quick_mode: false, age: 26 },
  { id: '4', nickname: 'Saki', photo_url: null, mood: 'cocktail', party_size: 'duo', quick_mode: true, age: 23 },
];

const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    sender: { id: 's1', nickname: 'Ken', photo_url: null, mood: 'shot', party_size: 'duo', quick_mode: false, age: 28 },
    item: 'TEQUILA SHOT',
    quantity: 2,
    meeting_point: '1F MAIN BAR',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    sender: { id: 's2', nickname: 'Taro', photo_url: null, mood: 'champagne', party_size: 'solo', quick_mode: false, age: 32 },
    item: 'MOJITO',
    quantity: 1,
    meeting_point: '2F LOUNGE',
    created_at: new Date().toISOString(),
  },
];

// Fallback drinks (used when DB is not available)
const FALLBACK_DRINKS = [
  { id: '1', name: 'TEQUILA SHOT', name_ja: 'テキーラショット', price: 660, discount_price: 560, discount_amount: 100, venue_id: 'club_nagoya', is_active: true },
  { id: '2', name: 'MOJITO', name_ja: 'モヒート', price: 990, discount_price: 840, discount_amount: 150, venue_id: 'club_nagoya', is_active: true },
  { id: '3', name: 'GIN TONIC', name_ja: 'ジントニック', price: 800, discount_price: 700, discount_amount: 100, venue_id: 'club_nagoya', is_active: true },
];

const FALLBACK_MEETING_POINTS = ['1F MAIN BAR', '2F LOUNGE', 'VIP AREA'];

const getMoodIcon = (mood: Mood): string => {
  switch (mood) {
    case 'shot': return '🍺';
    case 'cocktail': return '🍹';
    case 'champagne': return '🍾';
  }
};

const getPartySizeLabel = (size: PartySize): string => {
  switch (size) {
    case 'solo': return 'SOLO';
    case 'duo': return 'DUO';
    case 'group': return 'GROUP';
  }
};

// Male view component (Catalog)
function MaleFloorView({ onMatch, drinks, meetingPoints, isOnline, setIsOnline }: {
  onMatch: (quickMode: boolean) => void;
  drinks: DrinkItem[];
  meetingPoints: string[];
  isOnline: boolean;
  setIsOnline: (value: boolean) => void;
}) {
  const [selectedUser, setSelectedUser] = useState<FloorUser | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<DrinkItem | null>(drinks[0] || null);
  const [quantity, setQuantity] = useState(2); // Default to pair (×2)
  const [meetingPoint, setMeetingPoint] = useState(meetingPoints[0] || '1F MAIN BAR');
  const [pendingOffers, setPendingOffers] = useState<string[]>([]);

  // Update selectedDrink when drinks load
  useEffect(() => {
    if (drinks.length > 0 && !selectedDrink) {
      setSelectedDrink(drinks[0]);
    }
  }, [drinks]);

  const handleSendOffer = () => {
    if (pendingOffers.length >= 3) {
      Alert.alert('制限 / LIMIT', '同時に送信できるオファーは3件までです\nMax 3 pending offers allowed');
      return;
    }
    if (!selectedDrink || !selectedUser) return;

    const totalPrice = selectedDrink.discount_price * quantity;
    const totalDiscount = selectedDrink.discount_amount * quantity;

    Alert.alert(
      'CONFIRM OFFER',
      `送る相手: ${selectedUser.nickname} (${getPartySizeLabel(selectedUser.party_size)})\n` +
      `内容: ${selectedDrink.name} ×${quantity}\n` +
      `予想支払額: ¥${totalPrice.toLocaleString()} (${totalDiscount}円OFF)\n\n` +
      'ATTENTION\n' +
      '1. これは「合流の招待状」です。\n' +
      '2. 相手がOKしたら、バーカウンターへ向かってください。\n' +
      '3. お支払いは合流後にバーで行います。\n\n' +
      'This is an invitation to meet at the bar.\nPay at the counter after matching.',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '送信する / SEND',
          onPress: () => {
            // MAXIMUM vibration for match (critical in loud clubs)
            // 40 strong vibrations over 6 seconds for noticeable effect
            for (let i = 0; i < 40; i++) {
              setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                // Double up with notification for stronger effect
                if (i % 5 === 0) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }, i * 150);
            }
            setPendingOffers([...pendingOffers, selectedUser.id]);
            setSelectedUser(null);
            // Simulate match after delay (in real app, wait for acceptance)
            setTimeout(() => onMatch(selectedUser.quick_mode), 2000);
          },
        },
      ]
    );
  };

  const renderUserCard = ({ item }: { item: FloorUser }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => setSelectedUser(item)}
      disabled={pendingOffers.includes(item.id)}
    >
      <View style={styles.userPhoto}>
        {item.photo_url ? (
          <Image source={{ uri: item.photo_url }} style={styles.userImage} />
        ) : (
          <Text style={styles.userPhotoPlaceholder}>👤</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nickname}</Text>
        <View style={styles.userTags}>
          <Text style={styles.moodTag}>{getMoodIcon(item.mood)}</Text>
          <Text style={styles.partyTag}>{getPartySizeLabel(item.party_size)}</Text>
          {item.quick_mode && <Text style={styles.quickTag}>⏱️ 5min</Text>}
        </View>
      </View>
      {pendingOffers.includes(item.id) && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>オファー中</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.floorContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>FLOOR</Text>
          <Text style={styles.offerCount}>{pendingOffers.length}/3 オファー中</Text>
        </View>
        <View style={styles.onlineToggle}>
          <Text style={[styles.onlineLabel, isOnline && styles.onlineLabelActive]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsOnline(value);
            }}
            trackColor={{ false: Colors.darkGray, true: Colors.neonLime }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      <FlatList
        data={MOCK_WOMEN}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.userGrid}
      />

      {/* Offer Modal */}
      <Modal visible={!!selectedUser} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SEND OFFER</Text>
            <Text style={styles.modalSubtitle}>
              To: {selectedUser?.nickname} ({getPartySizeLabel(selectedUser?.party_size || 'solo')})
            </Text>

            {/* Explanation text */}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationText}>
                この方に乾杯オファーを送れます。{'\n'}
                ご希望のドリンクの種類を選んでください。{'\n'}
                ※マッチしたらバーカウンターでお支払いください。
              </Text>
              <Text style={styles.explanationTextEn}>
                Send a cheers offer to this person.{'\n'}
                Select your preferred drink.{'\n'}
                *Pay at the bar counter after matching.
              </Text>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Drink Selection */}
              <Text style={styles.sectionLabel}>DRINK</Text>
              {drinks.map((drink) => (
                <TouchableOpacity
                  key={drink.id}
                  style={[
                    styles.optionButton,
                    selectedDrink?.id === drink.id && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedDrink(drink)}
                >
                  <View>
                    <Text style={styles.optionText}>{drink.name} ×{quantity}</Text>
                    <Text style={styles.optionSubtext}>{drink.name_ja}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>¥{drink.discount_price * quantity}</Text>
                    <Text style={styles.discountText}>{drink.discount_amount * quantity}円OFF</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Quantity */}
              <Text style={styles.sectionLabel}>QUANTITY (×2 = PAIR)</Text>
              <View style={styles.quantityRow}>
                {[2, 4, 6].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.quantityButton,
                      quantity === q && styles.quantityButtonActive,
                    ]}
                    onPress={() => setQuantity(q)}
                  >
                    <Text style={styles.quantityText}>×{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Meeting Point */}
              <Text style={styles.sectionLabel}>MEETING POINT</Text>
              {meetingPoints.map((point) => (
                <TouchableOpacity
                  key={point}
                  style={[
                    styles.optionButton,
                    meetingPoint === point && styles.optionButtonActive,
                  ]}
                  onPress={() => setMeetingPoint(point)}
                >
                  <Text style={styles.optionText}>{point}</Text>
                </TouchableOpacity>
              ))}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>予想支払額 / TOTAL</Text>
                <View style={styles.totalPriceContainer}>
                  <Text style={styles.totalAmount}>
                    ¥{selectedDrink ? (selectedDrink.discount_price * quantity).toLocaleString() : 0}
                  </Text>
                  {selectedDrink && (
                    <Text style={styles.totalDiscount}>{selectedDrink.discount_amount * quantity}円OFF</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton} onPress={handleSendOffer}>
                <Text style={styles.sendButtonText}>🚀 送信</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Female view component (List)
function FemaleFloorView({ onMatch }: { onMatch: (quickMode: boolean) => void }) {
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [hasSeenWarning, setHasSeenWarning] = useState(false);
  const [pendingAccept, setPendingAccept] = useState<Offer | null>(null);

  const handlePass = (offerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOffers(offers.filter((o) => o.id !== offerId));
  };

  const handleCheers = (offer: Offer) => {
    if (!hasSeenWarning) {
      setPendingAccept(offer);
      return;
    }
    acceptOffer(offer);
  };

  const acceptOffer = (offer: Offer) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOffers(offers.filter((o) => o.id !== offer.id));
    onMatch(offer.sender.quick_mode || false);
  };

  const renderOfferCard = ({ item }: { item: Offer }) => (
    <View style={styles.offerCard}>
      <View style={styles.offerPhoto}>
        {item.sender.photo_url ? (
          <Image source={{ uri: item.sender.photo_url }} style={styles.offerImage} />
        ) : (
          <Text style={styles.offerPhotoPlaceholder}>👤</Text>
        )}
      </View>
      <View style={styles.offerDetails}>
        <Text style={styles.offerSender}>{item.sender.nickname}</Text>
        <Text style={styles.offerItem}>
          {item.item} x {item.quantity}
        </Text>
        <Text style={styles.offerMeetingPoint}>📍 {item.meeting_point}</Text>
      </View>
      <View style={styles.offerActions}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={() => handlePass(item.id)}
        >
          <Text style={styles.passButtonText}>✖️ PASS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cheersButton}
          onPress={() => handleCheers(item)}
        >
          <Text style={styles.cheersButtonText}>💚 CHEERS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.floorContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OFFERS</Text>
        <Text style={styles.offerCount}>{offers.length} 件</Text>
      </View>

      {offers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🥂</Text>
          <Text style={styles.emptyText}>オファーを待っています...</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOfferCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.offerList}
        />
      )}

      {/* First time warning modal */}
      <Modal visible={!!pendingAccept} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>WAIT!</Text>
            <Text style={styles.warningText}>
              mimoの「CHEERS」は{'\n'}「いいね」ではありません。{'\n\n'}
              「今すぐバーで合流する」{'\n'}という約束です。{'\n\n'}
              準備はいいですか？
            </Text>
            <View style={styles.warningButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPendingAccept(null)}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setHasSeenWarning(true);
                  acceptOffer(pendingAccept!);
                  setPendingAccept(null);
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

// Main Floor Screen
export default function FloorScreen() {
  const navigation = useNavigation<NavigationProp>();
  // In real app, this would come from user context/state
  const [userGender] = useState<'male' | 'female'>('male');
  const [drinks, setDrinks] = useState<DrinkItem[]>(FALLBACK_DRINKS);
  const [meetingPoints, setMeetingPoints] = useState<string[]>(FALLBACK_MEETING_POINTS);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true); // Online status toggle

  // Load drinks and venue data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load drinks from Supabase
        const dbDrinks = await getDrinks('club_nagoya');
        if (dbDrinks.length > 0) {
          setDrinks(dbDrinks);
        }

        // Try to load venue for meeting points
        const venue = await getVenue('club_nagoya');
        if (venue && venue.meeting_points) {
          setMeetingPoints(venue.meeting_points);
        }
      } catch (error) {
        console.log('Using fallback data (DB not available)');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMatch = (quickMode: boolean) => {
    // Navigate to match signal screen
    navigation.navigate('MatchSignal', {
      match: {
        id: 'demo',
        sender_id: 'demo',
        receiver_id: 'demo',
        venue_id: 'club_nagoya',
        item: drinks[0]?.name || 'TEQUILA SHOT',
        quantity: 2,
        meeting_point: meetingPoints[0] || '1F MAIN BAR',
        status: 'accepted',
        signal_number: Math.floor(Math.random() * 99) + 1,
      },
      isReceiver: false,
    });
  };

  if (loading) {
    return (
      <View style={[styles.floorContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.neonLime} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (userGender === 'male') {
    return <MaleFloorView onMatch={handleMatch} drinks={drinks} meetingPoints={meetingPoints} isOnline={isOnline} setIsOnline={setIsOnline} />;
  }
  return <FemaleFloorView onMatch={handleMatch} />;
}

const styles = StyleSheet.create({
  floorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  offerCount: {
    color: Colors.neonLime,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  headerLeft: {
    flex: 1,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineLabel: {
    color: Colors.gray,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  onlineLabelActive: {
    color: Colors.neonLime,
  },
  userGrid: {
    padding: 10,
  },
  userCard: {
    flex: 1,
    margin: 6,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  userPhoto: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.darkGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  userPhotoPlaceholder: {
    fontSize: 48,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  moodTag: {
    fontSize: 14,
  },
  partyTag: {
    color: Colors.lightGray,
    fontSize: 10,
    backgroundColor: Colors.darkGray,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quickTag: {
    color: Colors.neonLime,
    fontSize: 10,
    backgroundColor: 'rgba(166, 255, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.neonLime,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  modalSubtitle: {
    color: Colors.lightGray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  explanationBox: {
    backgroundColor: 'rgba(166, 255, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.neonLime,
  },
  explanationText: {
    color: Colors.white,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  explanationTextEn: {
    color: Colors.lightGray,
    fontSize: 11,
    lineHeight: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  sectionLabel: {
    color: Colors.neonLime,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  optionButtonActive: {
    borderColor: Colors.neonLime,
  },
  optionText: {
    color: Colors.white,
    fontSize: 16,
  },
  optionSubtext: {
    color: Colors.lightGray,
    fontSize: 12,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: Colors.neonLime,
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  discountText: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityButton: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  quantityButtonActive: {
    borderColor: Colors.neonLime,
  },
  quantityText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.darkGray,
  },
  totalLabel: {
    color: Colors.lightGray,
    fontSize: 14,
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    color: Colors.neonLime,
    fontSize: 28,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  totalDiscount: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.lightGray,
    fontSize: 14,
    marginTop: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 2,
    backgroundColor: Colors.neonLime,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Offer card styles (female view)
  offerList: {
    padding: 16,
  },
  offerCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.darkGray,
  },
  offerPhoto: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  offerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  offerPhotoPlaceholder: {
    fontSize: 80,
  },
  offerDetails: {
    marginBottom: 16,
  },
  offerSender: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  offerItem: {
    color: Colors.neonLime,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerMeetingPoint: {
    color: Colors.lightGray,
    fontSize: 14,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  passButton: {
    flex: 1,
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  passButtonText: {
    color: Colors.lightGray,
    fontSize: 16,
    fontWeight: '600',
  },
  cheersButton: {
    flex: 1,
    backgroundColor: Colors.neonLime,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cheersButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.lightGray,
    fontSize: 16,
  },
  // Warning modal
  warningModal: {
    backgroundColor: Colors.background,
    margin: 24,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neonLime,
  },
  warningIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  warningTitle: {
    color: Colors.neonLime,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 24,
  },
  warningText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.neonLime,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
