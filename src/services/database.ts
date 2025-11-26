import { supabase } from './supabase';
import { Profile, CheckIn, Match, Venue, FloorUser, Mood, PartySize } from '../types';

// Drink item type from database
export interface DrinkItem {
  id: string;
  name: string;
  name_ja: string;
  price: number;
  discount_price: number;
  discount_amount: number;
  venue_id: string;
  is_active: boolean;
}

// ========== PROFILES ==========

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function createProfile(profile: Omit<Profile, 'created_at'>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  return true;
}

// ========== VENUES ==========

export async function getVenue(venueId: string): Promise<Venue | null> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', venueId)
    .single();

  if (error) {
    console.error('Error fetching venue:', error);
    return null;
  }
  return data;
}

// ========== DRINKS ==========

export async function getDrinks(venueId: string): Promise<DrinkItem[]> {
  const { data, error } = await supabase
    .from('drinks')
    .select('*')
    .eq('venue_id', venueId)
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching drinks:', error);
    return [];
  }
  return data || [];
}

// ========== CHECK-INS ==========

export async function createCheckIn(checkIn: Omit<CheckIn, 'id' | 'created_at'>): Promise<CheckIn | null> {
  const { data, error } = await supabase
    .from('checkins')
    .insert(checkIn)
    .select()
    .single();

  if (error) {
    console.error('Error creating check-in:', error);
    return null;
  }
  return data;
}

export async function getActiveCheckIn(userId: string, venueId: string): Promise<CheckIn | null> {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching check-in:', error);
    return null;
  }
  return data;
}

// ========== FLOOR USERS ==========

export async function getFloorUsers(venueId: string, excludeUserId: string): Promise<FloorUser[]> {
  // Get active check-ins at this venue
  const { data, error } = await supabase
    .from('checkins')
    .select(`
      id,
      mood,
      party_size,
      quick_mode,
      user_id,
      profiles:user_id (
        id,
        nickname,
        photo_url
      )
    `)
    .eq('venue_id', venueId)
    .neq('user_id', excludeUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching floor users:', error);
    return [];
  }

  // Transform to FloorUser format
  return (data || []).map((checkin: any) => ({
    id: checkin.profiles.id,
    nickname: checkin.profiles.nickname,
    photo_url: checkin.profiles.photo_url,
    mood: checkin.mood as Mood,
    party_size: checkin.party_size as PartySize,
    quick_mode: checkin.quick_mode,
  }));
}

// ========== MATCHES ==========

export async function createMatch(match: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<Match | null> {
  // Generate a random signal number
  const signal_number = Math.floor(Math.random() * 99) + 1;

  const { data, error } = await supabase
    .from('matches')
    .insert({ ...match, signal_number })
    .select()
    .single();

  if (error) {
    console.error('Error creating match:', error);
    return null;
  }
  return data;
}

export async function updateMatchStatus(matchId: string, status: Match['status']): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', matchId);

  if (error) {
    console.error('Error updating match status:', error);
    return false;
  }
  return true;
}

export async function getPendingOffers(userId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('sender_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending offers:', error);
    return [];
  }
  return data || [];
}

export async function getReceivedOffers(userId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      sender:sender_id (
        id,
        nickname,
        photo_url
      )
    `)
    .eq('receiver_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching received offers:', error);
    return [];
  }
  return data || [];
}

export async function cancelOtherOffers(userId: string, acceptedMatchId: string): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('sender_id', userId)
    .eq('status', 'pending')
    .neq('id', acceptedMatchId);

  if (error) {
    console.error('Error cancelling other offers:', error);
    return false;
  }
  return true;
}

// ========== REALTIME SUBSCRIPTIONS ==========

export function subscribeToOffers(userId: string, callback: (offer: Match) => void) {
  return supabase
    .channel('offers')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'matches',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Match);
      }
    )
    .subscribe();
}

export function subscribeToMatchUpdates(matchId: string, callback: (match: Match) => void) {
  return supabase
    .channel(`match_${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`,
      },
      (payload) => {
        callback(payload.new as Match);
      }
    )
    .subscribe();
}
