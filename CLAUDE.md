# CLAUDE.md - AI Assistant Guide for mimo

This file provides guidance for AI assistants (like Claude) working on the mimo repository.

## Project Overview

**Repository:** Pechanco/mimo
**Status:** MVP Development for PoC

**Purpose:** 名古屋のクラブでの実証実験（PoC）用モバイルアプリ
**Target Users:** クラブ来場者（男女）
**Key Features:** QRチェックイン、無料ドリンクチケット、マッチング機能

## Repository Structure

```
mimo/
├── CLAUDE.md          # This file - AI assistant guidance
├── README.md          # Project documentation (to be created)
├── src/               # Source code (to be created)
├── tests/             # Test files (to be created)
├── docs/              # Documentation (to be created)
└── .github/           # GitHub workflows (to be created)
```

> Update this structure diagram as the codebase grows.

## Development Workflow

### Branch Naming Convention

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Documentation: `docs/<description>`
- Claude AI branches: `claude/<session-id>`

### Commit Message Format

Use clear, descriptive commit messages:
```
<type>: <short description>

[optional body with more details]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Pull Request Process

1. Create a feature branch from main
2. Make changes and commit with clear messages
3. Push to remote and create a PR
4. Ensure all tests pass
5. Request review if needed
6. Merge after approval

## Code Conventions

### General Guidelines

- Write clear, self-documenting code
- Keep functions small and focused (single responsibility)
- Use meaningful variable and function names
- Add comments only for complex logic, not obvious code
- Follow the DRY principle (Don't Repeat Yourself)

### File Organization

- Group related functionality together
- Keep files focused and not too large
- Use consistent naming conventions for files

## Testing Guidelines

- Write tests for new functionality
- Maintain good test coverage
- Run tests before committing
- Test edge cases and error conditions

## Common Tasks

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd mimo

# Install dependencies (update as needed)
# npm install / pip install -r requirements.txt / etc.
```

### Running Tests

```bash
# Add test commands here as they are configured
```

### Building/Running

```bash
# Add build/run commands here as they are configured
```

## AI Assistant Guidelines

### When Working on This Repository

1. **Read First**: Always read existing code before making changes
2. **Minimal Changes**: Make only the changes requested; avoid over-engineering
3. **Preserve Style**: Match existing code style and conventions
4. **Test Impact**: Consider how changes affect existing functionality
5. **Document Changes**: Update documentation when adding features

### Do Not

- Add unnecessary dependencies
- Create files that aren't needed
- Make changes beyond the scope of the request
- Skip reading relevant existing code
- Introduce security vulnerabilities

### File Handling

- Prefer editing existing files over creating new ones
- Delete unused code completely (no commented-out code)
- Keep files focused on their purpose

### Security Considerations

- Never commit secrets or credentials
- Validate user input at system boundaries
- Follow OWASP guidelines for web applications
- Use parameterized queries for database access

## Environment Variables

Document environment variables as they are added:

| Variable | Description | Required |
|----------|-------------|----------|
| _TBD_    | _TBD_       | _TBD_    |

## Dependencies

List major dependencies as they are added:

| Package | Purpose | Version |
|---------|---------|---------|
| _TBD_   | _TBD_   | _TBD_   |

## Troubleshooting

Document common issues and solutions as they arise:

### Issue: _Template_

**Symptoms:** _Description_
**Solution:** _Steps to resolve_

---

## Changelog

Track significant updates to this CLAUDE.md file:

- **2025-11-25**: Initial creation of CLAUDE.md for new repository
- **2025-11-25**: Added mimo MVP development requirements

---

> **Maintenance Note:** Keep this file updated as the project evolves. Add specific commands, conventions, and guidelines as they are established.

---

# 📁 mimo (ミモ) 開発要件定義書 [Diet MVP Final]

## 1. プロジェクト基本方針 (Project Policy)

- **目的**: 名古屋のクラブでの実証実験（PoC）
- **最優先事項**: 「バグらずに動くこと」。複雑な機能・アニメーションは全てカット
- **開発ツール**: Claude Code (AI) / Cursor
- **コード品質**: 完璧でなくて良い。コピペで動くレベルを目指す

## 2. 技術スタック (Tech Stack)

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Expo (React Native) |
| 言語 | TypeScript |
| データベース | Supabase (Auth, DB, Realtime) |
| デザイン | NativeWind (Tailwind CSS) |

## 3. デザインルール (Visuals)

**コンセプト: "Monster Energy" x "Cyberpunk"**

| 要素 | 値 |
|------|-----|
| 全体背景 | `#000000` (完全な黒) |
| 文字色 | `#FFFFFF` (白) |
| 強調色 | `#A6FF00` (ネオンライム) - ボタン、枠線、アイコンに使用 |
| フォント | 標準フォント。金額や数字は「太字（Bold）」または「Monospace（等幅）」を使用 |

## 4. アプリ構成 (Navigation)

**下部タブバーによる2画面構成**

1. **[🎫 TICKET]**: 無料ドリンクチケットを表示する画面（チェックイン後のホーム画面）
2. **[🥂 FLOOR]**: マッチングを行う画面

## 5. 機能要件 & 画面フロー (Features & Flow)

### 📱 Phase A: 入店 & チェックイン (Global)

GPS廃止。QRコード読み取り＝入店とみなす。

#### 1. QRスキャン
- カメラでQRコード（例: `mimo://venue/id_cafe`）を読み取る
- iOS版のみ開発する
- QRコードのリンク先は、アプリのディープリンクではなく**「WebのLP（振り分けページ）」**にする（iOSかAndroidかユーザーに選ばせる）

#### 2. 演出 (Unlock)
- 読み取り成功時、スマホを振動させる（Haptics）
- 画面に「🔓 UNLOCKED」と表示し、無料チケット画面へ遷移

#### 3. プロフィール登録 (初回のみ)
- ニックネーム / 性別 / 写真 (カメラロール可)
- ※画像はサーバー保存時に圧縮し、表示を軽くする

#### 4. ステータス入力 (毎回)
- **Mood**: `[🍺 Shot]` `[🍹 Cocktail]` `[🍾 Champagne]`
- **Party Size**: `[👤 1人]` `[👥 2人]` `[👥 3人以上]`
- **Options (女性のみ表示)**: `[ ✅ 5分限定モード ]`
  - ※ONにすると、自分のカードに `[⏱️ 5min]` タグが付く

### 📱 Tab 1: チケット画面 (The Ticket)

「無料ドリンク」を使うための画面。

#### 表示
- 黒いカード風デザイン
- 中央に大きく **1 FREE DRINK**
- 日付と店舗名を表示

#### アクション
- `[ スライドして使用 ]` ボタン
- スライドすると「USED」になり、現在時刻の秒数が動く（スクショ対策）

### 📱 Tab 2: フロア画面 (The Floor)

#### 👨 男性側UI (Catalog View)

**リスト表示**
- 縦スクロールのリスト（2列グリッド）
- 女性の写真、名前、年齢、Moodアイコン、Partyタグ、`[⏱️ 5min]`タグを表示

**オファー送信**
- 女性をタップ → 詳細モーダル表示
- 入力: ドリンク / 数量 / 集合場所 (例: 1F Bar)
- 送信ボタン: 「バーで支払います」に同意して送信
- 同時送信数: **Max 3人**
- 回復: 時間回復なし。返答が来るかキャンセルで枠が空く
- 排他制御: 「1人とマッチ成立した瞬間、他のオファーは全て自動キャンセル」

**送信確認シート例**
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

#### 👩 女性側UI (List View)

開発簡易化のため「Tinder風スワイプ」ではなく「Instagramフィード風」にする。

**リスト表示**
- 届いたオファーが縦に並ぶ（カードは大きめ）
- 表示内容: 男性の写真(大)、ドリンク名(大)、集合場所

**アクションボタン**
- 各カードの下に2つの大きなボタンを配置
- `[ ✖️ PASS ]` (グレー): リストから削除
- `[ 💚 CHEERS ]` (ネオンライム): マッチング成立画面へ

**初回のみ「確認モーダル」を出す（重要）**

最初の1回だけ、丁寧に止める。初めて右スワイプをした瞬間だけ、動作をキャンセルして、以下のポップアップを出します。

```
⚠️ WAIT!
mimoの右スワイプは「いいね」ではありません。
「今すぐバーで合流する」という約束です。

準備はいいですか？
[ キャンセル ]  [ 理解して合流する ]
```

- 2回目以降はこの表示を出しません
- これで「知らなかった」という事故は100%防げます

### 📱 Phase B: 合流シグナル (The Signal)

マッチング成立時に表示される全画面モーダル。

#### 共通表示
- 背景: 黒
- 中央: **No. 77** （大きな白文字）
- 枠線: ネオンカラー（CSS opacity アニメーションで点滅）
- 場所: `📍 MEET AT: 1F MAIN BAR`

#### 男性画面
- 金額: `¥1,400 (30% OFF)`
- ボタン: `[ スライドして完了 ]`

#### 女性画面
- 金額: 非表示 (`✨ GIFT ✨`)
- ボタン: なし（「相手を待っています」表示）

### 📱 Phase C: 5分タイマー (Timer)

「5分限定モード」がONの場合のみ発動。

1. **開始**: 男性が「スライド完了」した瞬間
2. **表示**: 画面が切り替わり、`05:00` からカウントダウン開始
3. **終了**: `00:00` でバイブ振動＋「終了です」ポップアップ

## 6. データベース設計 (Supabase Schema)

### venues (店舗)
| Column | Type | Description |
|--------|------|-------------|
| id | string | PK |
| name | string | 店舗名 |
| meeting_points | jsonb | 集合場所の配列 |

### profiles (ユーザー)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| nickname | string | ニックネーム |
| gender | text | 性別 |
| photo_url | text | プロフィール画像URL |

### checkins (入店状況)
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | ユーザーID |
| venue_id | string | 店舗ID |
| mood | text | Mood選択 |
| party_size | text | パーティサイズ |
| quick_mode | boolean | 5分限定モード |

### matches (取引)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| sender_id | uuid | 送信者ID |
| receiver_id | uuid | 受信者ID |
| venue_id | string | 店舗ID |
| item | text | ドリンク名 |
| quantity | integer | 数量 |
| meeting_point | text | 集合場所 |
| status | text | 'pending', 'accepted', 'redeemed', 'rejected' |
| signal_number | integer | 合流番号 |
