# 川柳なう。

<img src="public/logo_senryunow.png" alt="川柳なう。" width="320" />

毎日一句、みんなで詠む川柳・短歌SNS。

自分の句を投稿すると、今日みんなが詠んだ句を読めます。

---

## 機能

- **Google ログイン**で簡単に参加
- **川柳（5・7・5）** と **短歌（5・7・5・7・7）** の両対応
- 単語パーツを並べて句を作る**パーツモード**と、自由に書く**テキストモード**
- 5分間のカウントダウンで今日の一句を詠む
- 投稿後にフィードが解禁される（投稿しないと他の句は読めない）
- スタンプ・赤ペンコメント・返信などのリアクション
- 位置情報タグ付け
- プロフィールページ・お気に入りの句のピン留め
- アプリ内ブラウザ（LINE・Instagram 等）の検出と Safari/Chrome 誘導

## 技術スタック

| 領域 | 使用技術 |
|------|---------|
| フレームワーク | Next.js 16 (App Router) |
| UI | React 19 / Tailwind CSS v4 |
| 言語 | TypeScript |
| バックエンド | Firebase (Firestore + Google Auth) |
| 状態管理 | Zustand |
| ホスティング | Vercel |

## ローカル起動

```bash
npm install
npm run dev
```

`.env.local` に Firebase の設定を書いてください。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 仕様メモ

- 1日の区切りは **JST 15:00**（前日 15:00 〜 当日 14:59 が同じ「今日」）
- 1ユーザー 1日 1句まで
- フィードは自分が投稿するまでぼかし表示

## ライセンス

MIT
