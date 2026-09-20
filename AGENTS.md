# WEBサイト課題の提出サイト — 作業規約

このリポジトリは、名古屋のAIビジネス専門学校におけるPBL型「WEBサイト課題の提出サイト」のソースです。新規セッションでは、まず `README.md`、次に `docs/引き継ぎ.md` を読み、作業目的と本番構成を確認してください。

## 構成

- `app/`: Vite / React / Three.js の公開提出サイト。VercelのRoot Directoryは必ず `app`。
- `apps-script/`: Gmail受信をGoogle Sheetsへ反映するGoogle Apps Script。
- `docs/`: 運用、障害対応、引き継ぎ情報。

## 変更時のルール

1. UI・課題内容は `app/src/` を編集する。課題IDは `app/src/content.js` とGoogle Sheetsの `PBL課題一覧` で一致させる。
2. Apps Scriptの変更はまず `apps-script/` を正として更新する。本番反映は `docs/引き継ぎ.md` の同期手順に従う。
3. 秘密値、個人メール、Spreadsheet ID、Apps Script ID、OAuthトークン、Vercelトークンをコミットしない。ローカルの運用値は `ops.local.md`（Git管理外）だけに置く。
4. 既存の別Vercelプロジェクトには触れない。この提出サイトのVercelプロジェクトだけを対象にする。
5. 外部にメールを送る・トリガーを作り直す・本番環境変数を変える操作は、運用者の明確な指示があるときだけ行う。

## 確認コマンド

```sh
cd app
npm ci
npm run verify
```

`main` へpushすると接続済みのVercel本番環境が更新される。コードを変えた場合は、検証完了後に差分を明示してコミット・pushする。

## 引き継ぎの完了条件

新しい担当者が、秘密情報なしでもローカルで画面・メール生成・Apps Scriptのロジックを検証でき、運用者からGoogle/Vercelアクセスを受ければ本番を保守できる状態を保つこと。
