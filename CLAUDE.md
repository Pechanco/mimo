# CLAUDE.md - AI Assistant Guide for mimo

This file provides guidance for AI assistants (like Claude) working on the mimo repository.

## Project Overview

**Repository:** Pechanco/mimo
**Type:** React Native Mobile Application
**Framework:** Expo SDK 54
**Language:** TypeScript

> **Note:** 要件定義が共有され次第、このセクションを更新してください。

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Expo | ~54.0.25 | React Native開発フレームワーク |
| React | 19.1.0 | UIライブラリ |
| React Native | 0.81.5 | モバイルアプリフレームワーク |
| TypeScript | ~5.9.2 | 型安全な開発 |

## Repository Structure

```
mimo/
├── App.tsx            # メインアプリコンポーネント
├── app.json           # Expo設定
├── index.ts           # エントリーポイント
├── tsconfig.json      # TypeScript設定
├── package.json       # 依存関係
├── assets/            # 画像・アイコン
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
└── CLAUDE.md          # このファイル
```

## Development Commands

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm start

# プラットフォーム別起動
npm run android    # Android
npm run ios        # iOS (macOS必要)
npm run web        # Web
```

## Code Conventions

### ファイル命名規則

- コンポーネント: `PascalCase.tsx` (例: `HomeScreen.tsx`)
- ユーティリティ: `camelCase.ts` (例: `apiClient.ts`)
- 型定義: `types.ts` または `*.types.ts`
- スタイル: コンポーネント内に `StyleSheet.create()` で定義

### ディレクトリ構成 (推奨)

```
src/
├── components/     # 再利用可能なコンポーネント
├── screens/        # 画面コンポーネント
├── navigation/     # ナビゲーション設定
├── hooks/          # カスタムフック
├── services/       # API・外部サービス
├── utils/          # ユーティリティ関数
├── types/          # 型定義
└── constants/      # 定数
```

### コーディングスタイル

- 関数コンポーネントを使用
- React Hooksを活用
- 型定義を必ず付ける
- スタイルは `StyleSheet.create()` を使用

## AI Assistant Guidelines

### Expo/React Native開発時の注意

1. **プラットフォーム差異**: iOS/Androidの違いを考慮
2. **Expoの制約**: Expo Goで動作しないネイティブモジュールに注意
3. **パフォーマンス**: 不要な再レンダリングを避ける
4. **型安全**: TypeScriptの型を適切に定義

### よく使うExpoパッケージ

```bash
# ナビゲーション
npx expo install @react-navigation/native @react-navigation/stack

# 安全なエリア
npx expo install react-native-safe-area-context

# アイコン
npx expo install @expo/vector-icons

# ストレージ
npx expo install @react-native-async-storage/async-storage
```

### インストール時の注意

- `npm install` ではなく `npx expo install` を使用
- Expo SDKと互換性のあるバージョンが自動選択される

## Environment Variables

Expoでの環境変数設定:

```bash
# .env ファイル (git管理外)
EXPO_PUBLIC_API_URL=https://api.example.com
```

```typescript
// コード内での使用
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Troubleshooting

### Metro bundlerのキャッシュクリア

```bash
npx expo start --clear
```

### node_modulesの再インストール

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Changelog

- **2025-11-25**: Expoプロジェクト用にCLAUDE.mdを更新
- **2025-11-25**: 初期作成
