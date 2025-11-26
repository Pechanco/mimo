-- mimo Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- ========== VENUES (店舗) ==========
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meeting_points JSONB DEFAULT '["1F MAIN BAR"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== PROFILES (ユーザープロフィール) ==========
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== DRINKS (ドリンクメニュー) ==========
CREATE TABLE IF NOT EXISTS drinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  price INTEGER NOT NULL,
  discount_price INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== CHECKINS (入店状況) ==========
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id TEXT REFERENCES venues(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('shot', 'cocktail', 'champagne')),
  party_size TEXT NOT NULL CHECK (party_size IN ('solo', 'duo', 'group')),
  quick_mode BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== MATCHES (マッチング・取引) ==========
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id TEXT REFERENCES venues(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantity INTEGER DEFAULT 2,
  meeting_point TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'redeemed', 'rejected', 'cancelled')),
  signal_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_checkins_venue ON checkins(venue_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_sender ON matches(sender_id);
CREATE INDEX IF NOT EXISTS idx_matches_receiver ON matches(receiver_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_drinks_venue ON drinks(venue_id);

-- ========== ROW LEVEL SECURITY (RLS) ==========
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;

-- Allow public read for venues and drinks
CREATE POLICY "Venues are viewable by everyone" ON venues FOR SELECT USING (true);
CREATE POLICY "Drinks are viewable by everyone" ON drinks FOR SELECT USING (true);

-- Profiles: users can read all, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (true);

-- Checkins: viewable by venue attendees
CREATE POLICY "Checkins are viewable by everyone" ON checkins FOR SELECT USING (true);
CREATE POLICY "Users can insert checkins" ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own checkins" ON checkins FOR UPDATE USING (true);

-- Matches: participants can view and update
CREATE POLICY "Matches are viewable by participants" ON matches FOR SELECT USING (true);
CREATE POLICY "Users can insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Participants can update matches" ON matches FOR UPDATE USING (true);

-- ========== INITIAL DATA ==========

-- Insert default venue
INSERT INTO venues (id, name, meeting_points) VALUES
  ('club_nagoya', 'CLUB NAGOYA', '["1F MAIN BAR", "2F LOUNGE", "VIP AREA"]')
ON CONFLICT (id) DO NOTHING;

-- Insert drinks for the venue
INSERT INTO drinks (venue_id, name, name_ja, price, discount_price, discount_amount) VALUES
  ('club_nagoya', 'TEQUILA SHOT', 'テキーラショット', 660, 560, 100),
  ('club_nagoya', 'MOJITO', 'モヒート', 990, 840, 150),
  ('club_nagoya', 'GIN TONIC', 'ジントニック', 800, 700, 100),
  ('club_nagoya', 'CHAMPAGNE', 'シャンパン', 5000, 4000, 1000)
ON CONFLICT DO NOTHING;

-- ========== REALTIME ==========
-- Enable realtime for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
