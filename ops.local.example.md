# 本番運用メモ（ローカル専用の見本）

このファイルを `ops.local.md` にコピーして、管理者だけが使う実値を記録します。`ops.local.md` はGit管理外です。**この見本にも実値は記入しないでください。**

## 公開環境

- 公開URL: `https://web-site-assignment-desk.vercel.app`
- Vercel team / project: `<team>/<project>`
- Vercel Root Directory: `app`
- Vercel環境変数 `VITE_SUBMISSION_TO`: `<提出専用メールアドレス>`
- 更新経路: `main` へpush → Vercel Production

## Google運用環境

- 提出管理Spreadsheet URL / ID: `<URL または ID>`
- Apps Script 編集URL / Script ID: `<URL または ID>`
- 受信するGoogleアカウント: `<アカウント>`
- `SPREADSHEET_ID`: `<ID>`
- `ALLOWED_SENDER_DOMAIN`（任意）: `<学校ドメインまたは空欄>`
- トリガー: `scanSubmissionMailbox` / 10分ごと
- 最終稼働確認: `<YYYY-MM-DD HH:mm JST>`

## 管理者チェック

- [ ] Vercelの当該プロジェクトへの編集権限がある
- [ ] 受信GmailとApps Scriptの編集権限がある
- [ ] 提出管理Spreadsheetの編集権限がある
- [ ] 本番メールを送らずにローカル検証できた
