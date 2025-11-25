// User & Profile types

export type Gender = 'male' | 'female';

export type Mood = 'shot' | 'cocktail' | 'champagne';

export type PartySize = 'solo' | 'duo' | 'group';

export interface Profile {
  id: string;
  nickname: string;
  gender: Gender;
  photo_url: string | null;
  created_at?: string;
}

export interface CheckIn {
  id?: string;
  user_id: string;
  venue_id: string;
  mood: Mood;
  party_size: PartySize;
  quick_mode: boolean; // 5分限定モード
  created_at?: string;
}

// Venue types

export interface Venue {
  id: string;
  name: string;
  meeting_points: string[];
}

// Match types

export type MatchStatus = 'pending' | 'accepted' | 'redeemed' | 'rejected' | 'cancelled';

export interface Match {
  id: string;
  sender_id: string;
  receiver_id: string;
  venue_id: string;
  item: string;
  quantity: number;
  meeting_point: string;
  status: MatchStatus;
  signal_number: number;
  created_at?: string;
  updated_at?: string;
}

// UI types for Floor screen

export interface FloorUser {
  id: string;
  nickname: string;
  photo_url: string | null;
  mood: Mood;
  party_size: PartySize;
  quick_mode: boolean;
  age?: number;
}

export interface Offer {
  id: string;
  sender: FloorUser;
  item: string;
  quantity: number;
  meeting_point: string;
  created_at: string;
}

// Drink items

export interface DrinkItem {
  id: string;
  name: string;
  price: number;
  discount_price: number;
}

// Navigation types

export type RootStackParamList = {
  QRScanner: undefined;
  Profile: undefined;
  StatusInput: { venue_id: string };
  Main: undefined;
  MatchSignal: { match: Match; isReceiver: boolean };
  Timer: { match: Match };
};

export type MainTabParamList = {
  Ticket: undefined;
  Floor: undefined;
};
