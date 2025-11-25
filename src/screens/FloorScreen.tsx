import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FloorUser, Offer, Mood, PartySize } from '../types';

// Mock data for development
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

const DRINKS = [
  { id: '1', name: 'TEQUILA SHOT', price: 800, discount_price: 560 },
  { id: '2', name: 'MOJITO', price: 1200, discount_price: 840 },
  { id: '3', name: 'GIN TONIC', price: 1000, discount_price: 700 },
  { id: '4', name: 'CHAMPAGNE', price: 5000, discount_price: 3500 },
];

const MEETING_POINTS = ['1F MAIN BAR', '2F LOUNGE', 'VIP AREA'];

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
function MaleFloorView({ onMatch }: { onMatch: () => void }) {
  const [selectedUser, setSelectedUser] = useState<FloorUser | null>(null);
  const [selectedDrink, setSelectedDrink] = useState(DRINKS[0]);
  const [quantity, setQuantity] = useState(1);
  const [meetingPoint, setMeetingPoint] = useState(MEETING_POINTS[0]);
  const [pendingOffers, setPendingOffers] = useState<string[]>([]);

  const handleSendOffer = () => {
    if (pendingOffers.length >= 3) {
      Alert.alert('制限', '同時に送信できるオファーは3件までです');
      return;
    }

    Alert.alert(
      'CONFIRM OFFER',
      `送る相手: ${selectedUser?.nickname} (${getPartySizeLabel(selectedUser?.party_size || 'solo')})\n` +
      `内容: ${selectedDrink.name} x ${quantity}\n` +
      `予想支払額: ¥${(selectedDrink.discount_price * quantity).toLocaleString()} (現地払い)\n\n` +
      '⚠️ ATTENTION\n' +
      '1. これは「合流の招待状」です。\n' +
      '2. 相手がOKしたら、必ずバーカウンターへ向かってください。\n' +
      '3. お支払いは合流後にバーで行います。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '規約に同意して送信',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPendingOffers([...pendingOffers, selectedUser!.id]);
            setSelectedUser(null);
            // In real app, this would trigger match after acceptance
            setTimeout(onMatch, 2000);
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
          <Text style={styles.pendingText}>送信中</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.floorContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FLOOR</Text>
        <Text style={styles.offerCount}>{pendingOffers.length}/3 オファー中</Text>
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

            <ScrollView style={styles.modalScroll}>
              {/* Drink Selection */}
              <Text style={styles.sectionLabel}>DRINK</Text>
              {DRINKS.map((drink) => (
                <TouchableOpacity
                  key={drink.id}
                  style={[
                    styles.optionButton,
                    selectedDrink.id === drink.id && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedDrink(drink)}
                >
                  <Text style={styles.optionText}>{drink.name}</Text>
                  <Text style={styles.priceText}>¥{drink.discount_price}</Text>
                </TouchableOpacity>
              ))}

              {/* Quantity */}
              <Text style={styles.sectionLabel}>QUANTITY</Text>
              <View style={styles.quantityRow}>
                {[1, 2, 3, 4].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={[
                      styles.quantityButton,
                      quantity === q && styles.quantityButtonActive,
                    ]}
                    onPress={() => setQuantity(q)}
                  >
                    <Text style={styles.quantityText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Meeting Point */}
              <Text style={styles.sectionLabel}>MEETING POINT</Text>
              {MEETING_POINTS.map((point) => (
                <TouchableOpacity
                  key={point}
                  style={[
                    styles.optionButton,
                    meetingPoint === point && styles.optionButtonActive,
                  ]}
                  onPress={() => setMeetingPoint(point)}
                >
                  <Text style={styles.optionText}>📍 {point}</Text>
                </TouchableOpacity>
              ))}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>予想支払額</Text>
                <Text style={styles.totalAmount}>
                  ¥{(selectedDrink.discount_price * quantity).toLocaleString()}
                </Text>
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
function FemaleFloorView({ onMatch }: { onMatch: () => void }) {
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
    onMatch();
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
  // In real app, this would come from user context/state
  const [userGender] = useState<'male' | 'female'>('male');
  const [showMatchSignal, setShowMatchSignal] = useState(false);

  const handleMatch = () => {
    // Navigate to match signal screen
    setShowMatchSignal(true);
  };

  if (userGender === 'male') {
    return <MaleFloorView onMatch={handleMatch} />;
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
    fontSize: 14,
    fontWeight: '600',
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
  priceText: {
    color: Colors.neonLime,
    fontSize: 16,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
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
  totalAmount: {
    color: Colors.neonLime,
    fontSize: 28,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
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
