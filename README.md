# WEBサイト課題の提出サイト

AIビジネス専門学校のPBL授業向け提出デスクです。生徒は3D課題ギャラリーから課題を選び、公開URLを入力して提出メールを作成します。Apps Scriptがメールを監視し、Google Sheetsへ提出履歴を記録します。

**公開URL:** [web-site-assignment-desk.vercel.app](https://web-site-assignment-desk.vercel.app)

## このリポだけで管理するもの

```text
生徒 → Vercelの提出サイト → 提出メール → Gmail監視 → Google Sheets
              app/                 apps-script/
```

| 場所 | 役割 |
| --- | --- |
| `app/` | React + Three.js の提出サイト。課題カード・提出フォーム・Vercel設定 |
| `apps-script/` | Gmailを読み、提出をスプレッドシートへ登録するGoogle Apps Script |
| `docs/` | 仕組み・日常運用・障害対応 |
| `app/.env.example` | 提出先メールの設定見本。実際の値はGitHubに保存しない |

## 最短セットアップ

### 1. 提出サイトを公開する

VercelでこのリポをImportし、**Root Directory を `app`** に設定します。Environment Variables に次を追加して本番デプロイしてください。

```text
VITE_SUBMISSION_TO=学校の提出専用メールアドレス
```

このリポの `main` へのpushは、接続済みのVercelプロジェクトを本番更新します。

ローカル確認は次のとおりです。

```sh
cd app
copy .env.example .env.local
# .env.local の値を実際の提出先メールへ変更
npm ci
npm run dev
```

### 2. Gmail監視を有効にする

`apps-script/README.md` の初回セットアップに従ってください。Google Apps Scriptへコードを貼り、`SPREADSHEET_ID` をScript Propertiesへ設定して `setupSubmissionDesk` を一度実行します。

## 運用ドキュメント

- [仕組み](docs/仕組み.md)
- [日常運用と障害対応](docs/運用手順.md)
- [Apps Scriptのセットアップ](apps-script/README.md)

## 検証

```sh
cd app
npm run verify
```

## 設定値の扱い

GitHubに保存しないもの:

- `VITE_SUBMISSION_TO` の実値
- Google Spreadsheet ID
- 学校メールの許可ドメイン
- Apps ScriptのプロジェクトID・OAuth認可情報

提出先メールはブラウザの `mailto:` に使われるため、サイト利用者から見える値です。専用の授業提出アドレスを用意する運用を推奨します。
