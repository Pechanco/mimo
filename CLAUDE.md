# CLAUDE.md - AI Assistant Guide for mimo

This file provides guidance for AI assistants (like Claude) working on the mimo repository.

---

## 1. プロジェクト基本方針 (Project Policy)

**Repository:** Pechanco/mimo
**目的:** 名古屋のクラブでの実証実験（PoC）

### 最優先事項
- **「バグらずに動くこと」** - 複雑な機能・アニメーションは全てカット
- 開発ツール: Claude Code (AI) / Cursor
- コード品質: 完璧でなくて良い。コピペで動くレベルを目指す

---

## 2. 技術スタック (Tech Stack)

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Expo (React Native) | ~54.0.25 |
| Language | TypeScript | ~5.9.2 |
| UI | React | 19.1.0 |
| Mobile | React Native | 0.81.5 |
| Database | Supabase (Auth, DB, Realtime) | - |
| Styling | NativeWind (Tailwind CSS) | - |

---

## 3. デザインルール (Visuals)

**コンセプト: "Monster Energy" x "Cyberpunk"**

| Element | Value |
|---------|-------|
| 全体背景 | `#000000` (完全な黒) |
| 文字色 | `#FFFFFF` (白) |
| 強調色 | `#A6FF00` (ネオンライム) - ボタン、枠線、アイコン |
| フォント | 標準フォント。金額や数字は**太字(Bold)**または**Monospace(等幅)** |

---

## 4. アプリ構成 (Navigation)

**下部タブバーによる2画面構成**

| Tab | Icon | Name | Description |
|-----|------|------|-------------|
| 1 | 🎫 | TICKET | 無料ドリンクチケット画面（チェックイン後のホーム） |
| 2 | 🥂 | FLOOR | マッチング画面 |

---

## 5. 機能要件 & 画面フロー (Features & Flow)

### 📱 Phase A: 入店 & チェックイン (Global)

**GPS廃止。QRコード読み取り＝入店とみなす。**

#### A-1. QRスキャン
- カメラでQRコード（例: `mimo://venue/id_cafe`）を読み取る
- **iOS版のみ開発**
- QRコードのリンク先は **WebのLP（振り分けページ）** にする（iOS/Android選択）

#### A-2. 演出 (Unlock)
- 読み取り成功時、スマホを振動（Haptics）
- 画面に「🔓 UNLOCKED」と表示
- 無料チケット画面へ遷移

#### A-3. プロフィール登録 (初回のみ)
- ニックネーム
- 性別
- 写真 (カメラロール可)
- ※画像はサーバー保存時に圧縮

#### A-4. ステータス入力 (毎回)
```
Mood: [🍺 Shot] [🍹 Cocktail] [🍾 Champagne]
Party Size: [👤 1人] [👥 2人] [👥 3人以上]
Options (女性のみ): [ ✅ 5分限定モード ]
```
※ONにすると、自分のカードに `[⏱️ 5min]` タグが付く

---

### 📱 Tab 1: チケット画面 (The Ticket)

「無料ドリンク」を使うための画面

#### 表示
- 黒いカード風デザイン
- 中央に大きく **1 FREE DRINK**
- 日付と店舗名を表示

#### アクション
- `[ スライドして使用 ]` ボタン
- スライドすると「USED」になり、現在時刻の秒数が動く（スクショ対策）

---

### 📱 Tab 2: フロア画面 (The Floor)

#### 👨 男性側UI (Catalog View)

**リスト表示**
- 縦スクロールのリスト（2列グリッド）
- 表示: 女性の写真、名前、年齢、Moodアイコン、Partyタグ、`[⏱️ 5min]`タグ

**オファー送信**
1. 女性をタップ → 詳細モーダル表示
2. 入力: ドリンク / 数量 / 集合場所 (例: 1F Bar)
3. 送信ボタン: 「バーで支払います」に同意して送信

**送信確認シート例:**
```
CONFIRM OFFER
送る相手: Mika (DUO)
内容: TEQUILA SHOT x 2
予想支払額: ¥1,400 (現地払い)

⚠️ ATTENTION
1. これは「合流の招待状」です。
2. 相手がOKしたら、必ずバーカウンターへ向かってください。
3. お支払いは合流後にバーで行います。

[ 🚀 規約に同意して送信 (SEND) ]
```

**制限ルール**
- 同時送信数: **Max 3人**
- 回復: 時間回復なし。返答が来るかキャンセルで枠が空く
- 排他制御: **1人とマッチ成立した瞬間、他のオファーは全て自動キャンセル**

#### 👩 女性側UI (List View)

**開発簡易化のため「Instagramフィード風」（Tinder風スワイプではない）**

**リスト表示**
- 届いたオファーが縦に並ぶ（カードは大きめ）
- 表示: 男性の写真(大)、ドリンク名(大)、集合場所

**アクションボタン**
- `[ ✖️ PASS ]` (グレー): リストから削除
- `[ 💚 CHEERS ]` (ネオンライム): マッチング成立画面へ

**初回のみ確認モーダル（重要）**
```
⚠️ WAIT!
mimoの右スワイプは「いいね」ではありません。
「今すぐバーで合流する」という約束です。

準備はいいですか？

[ キャンセル ]  [ 理解して合流する ]
```
※2回目以降は表示しない

---

### 📱 Phase B: 合流シグナル (The Signal)

**マッチング成立時に表示される全画面モーダル**

#### 共通表示
- 背景: 黒
- 中央: `No. 77` （大きな白文字）
- 枠線: ネオンカラー（CSS opacity アニメーションで点滅）
- 場所: `📍 MEET AT: 1F MAIN BAR`

#### 男性画面
- 金額: `¥1,400 (30% OFF)`
- ボタン: `[ スライドして完了 ]`

#### 女性画面
- 金額: 非表示 (`✨ GIFT ✨`)
- ボタン: なし（「相手を待っています」表示）

---

### 📱 Phase C: 5分タイマー (Timer)

**「5分限定モード」がONの場合のみ発動**

1. **開始**: 男性が「スライド完了」した瞬間
2. **表示**: 画面が切り替わり、`05:00` からカウントダウン開始
3. **終了**: `00:00` でバイブ振動＋「終了です」ポップアップ

---

## 6. データベース設計 (Supabase Schema)

### venues (店舗)
```sql
id: string (PK)
name: string
meeting_points: jsonb (配列)
```

### profiles (ユーザー)
```sql
id: uuid (PK)
nickname: string
gender: text
photo_url: text
```

### checkins (入店状況)
```sql
user_id: uuid
venue_id: string
mood: text
party_size: text
quick_mode: boolean
```

### matches (取引)
```sql
id: uuid
sender_id: uuid
receiver_id: uuid
venue_id: string
item: text
quantity: integer
meeting_point: text
status: text ('pending', 'accepted', 'redeemed', 'rejected')
signal_number: integer
```

---

## 7. Repository Structure

```
mimo/
├── App.tsx            # メインアプリコンポーネント
├── app.json           # Expo設定
├── index.ts           # エントリーポイント
├── tsconfig.json      # TypeScript設定
├── package.json       # 依存関係
├── assets/            # 画像・アイコン
└── src/
    ├── components/    # 再利用可能なコンポーネント
    ├── screens/       # 画面コンポーネント
    ├── navigation/    # ナビゲーション設定
    ├── hooks/         # カスタムフック
    ├── services/      # Supabase等
    ├── utils/         # ユーティリティ
    ├── types/         # 型定義
    └── constants/     # 定数・カラー
```

---

## 8. Development Commands

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm start

# プラットフォーム別起動
npm run ios        # iOS (メイン)
npm run android    # Android
npm run web        # Web
```

---

## 9. AI Assistant Guidelines

### 開発時の注意

1. **シンプルに**: 複雑なアニメーション・機能は避ける
2. **動作優先**: 完璧より「バグらず動く」を重視
3. **iOS優先**: iOS版のみ開発
4. **型定義**: TypeScriptの型を適切に定義

### パッケージインストール

```bash
# 必ず npx expo install を使用
npx expo install <package-name>
```

### 環境変数

```bash
# .env (git管理外)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## Changelog

- **2025-11-25**: 要件定義書を追記 (Diet MVP Final)
- **2025-11-25**: Expoプロジェクト用にCLAUDE.mdを更新
- **2025-11-25**: 初期作成
