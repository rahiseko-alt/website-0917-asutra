# Personal Portfolio — WebGL Demo

React + Three.js + GSAP の個人ポートフォリオ試作。デモ画像を含みます。

## ローカル起動

Node.js 22以上を利用してください。

```sh
cd app
npm ci
npm run dev
```

## Vercelへデプロイ

このリポジトリをVercelへImportし、**Root Directoryを `app`** に設定します。
`app/vercel.json` がビルド方法と公開フォルダを指定しています。

- Framework: Vite
- Build: `npx vite build`
- Output: `dist/client`
- Install: `npm ci`
- 環境変数: 不要

## 構成

- `app/src/`: 画面・WebGL・操作のコード
- `app/public/assets/`: 生成したデモ画像
- `app/package-lock.json`: 依存バージョン固定
- `licenses/`、`OSS-NOTES.md`: 使用ライブラリとライセンス
- `CHANGES*.md`、`evidence*/`、`audit*/`: 修正履歴・比較・調査記録
- `image-prompts*.json`: 画像生成時のプロンプト

画像・名称・作品情報は試作用です。お問い合わせフォームは外部送信しません。
GSAPは独自ライセンス、Three.jsはMITです。詳細は `OSS-NOTES.md` を参照してください。
