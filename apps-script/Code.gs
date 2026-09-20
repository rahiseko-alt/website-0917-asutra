/**
 * WEBサイト課題の提出監視
 *
 * 初回に setupSubmissionDesk() を実行し、Script Properties を設定する。
 * Gmail の提出メールを10分ごとに読み、Google Sheetsへ登録・再提出更新する。
 */
const DESK = {
  prefix: '【WEB提出】',
  label: 'WEB提出',
  assignments: 'PBL課題一覧',
  submissions: '提出一覧',
  ledger: '_受信台帳',
  review: '要確認',
  errors: '_障害ログ'
};

const DEFAULT_ASSIGNMENTS = [
  ['PBL-01', '地域の飲食店の顧客分析と集客提案', 'WEBサイト + 提案資料（PDF）', '課題への提案 / AI利用の記録 / 著作権・引用 / 個人情報', 'メールで提出', '受付中', 1],
  ['PBL-02', 'インバウンド向け観光プロモーション提案', 'WEBサイト + 提案資料（PDF）', '課題への提案 / AI利用の記録 / 著作権・引用 / 個人情報', 'メールで提出', '受付中', 2],
  ['PBL-03', 'AIを活用した市場調査と新規事業提案', 'WEBサイト + 提案資料（PDF）', '課題への提案 / AI利用の記録 / 著作権・引用 / 個人情報', 'メールで提出', '受付中', 3]
];

function setupSubmissionDesk() {
  const config = getConfig_();
  prepareSheets_(SpreadsheetApp.openById(config.spreadsheetId));
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'scanSubmissionMailbox') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('scanSubmissionMailbox').timeBased().everyMinutes(10).create();
  return '提出管理シートと10分ごとのGmail監視を準備しました。';
}

function scanSubmissionMailbox() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try {
    const config = getConfig_();
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    prepareSheets_(ss);
    const seen = messageIds_(ss.getSheetByName(DESK.ledger));
    const label = GmailApp.getUserLabelByName(DESK.label) || GmailApp.createLabel(DESK.label);

    GmailApp.search('subject:' + DESK.prefix + ' newer_than:365d', 0, 100).forEach(function(thread) {
      thread.getMessages().forEach(function(message) {
        if (seen.has(message.getId())) return;
        const item = parseSubmission_(message, config);
        if (!item.ok) {
          ss.getSheetByName(DESK.review).appendRow([new Date(), message.getFrom(), message.getSubject(), item.reason, message.getId()]);
          log_(ss, message, '', '要確認', item.reason, '');
          return;
        }
        const row = upsertSubmission_(ss.getSheetByName(DESK.submissions), item, message);
        log_(ss, message, item.key, '受付完了', '', row);
        thread.addLabel(label);
      });
    });
  } catch (error) {
    const config = getConfig_();
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    prepareSheets_(ss);
    ss.getSheetByName(DESK.errors).appendRow([new Date(), String(error), error.stack || '']);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function parseSubmission_(message, config) {
  const subject = message.getSubject().trim();
  if (subject.indexOf(DESK.prefix) !== 0) return {ok: false, reason: '件名前方が【WEB提出】ではありません。'};
  const parts = subject.slice(DESK.prefix.length).trim().split('｜').map(function(value) { return value.trim(); });
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return {ok: false, reason: '件名は【WEB提出】課題ID｜学籍番号｜氏名 の形式にしてください。'};

  const sender = emailAddress_(message.getFrom());
  if (config.allowedSenderDomain && !sender.endsWith('@' + config.allowedSenderDomain)) return {ok: false, reason: '学校メール以外からの提出です。'};
  const match = message.getPlainBody().match(/^URL:\s*(https:\/\/\S+)/mi);
  if (!match) return {ok: false, reason: '本文に URL: https://... を記載してください。'};

  return {ok: true, assignmentId: parts[0], studentId: parts[1], studentName: parts[2], senderEmail: sender, url: match[1], key: parts[0] + '|' + parts[1]};
}

function upsertSubmission_(sheet, item, message) {
  const values = sheet.getDataRange().getValues();
  const now = new Date();
  for (let index = 1; index < values.length; index += 1) {
    if (values[index][0] === item.assignmentId && values[index][1] === item.studentId) {
      const count = Number(values[index][6]) || 1;
      sheet.getRange(index + 1, 1, 1, 9).setValues([[item.assignmentId, item.studentId, item.studentName, item.senderEmail, item.url, now, count + 1, '受付完了', message.getId()]]);
      return index + 1;
    }
  }
  sheet.appendRow([item.assignmentId, item.studentId, item.studentName, item.senderEmail, item.url, now, 1, '受付完了', message.getId()]);
  return sheet.getLastRow();
}

function getConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Script Properties に SPREADSHEET_ID を設定してください。');
  return {spreadsheetId: spreadsheetId, allowedSenderDomain: properties.getProperty('ALLOWED_SENDER_DOMAIN') || ''};
}

function prepareSheets_(ss) {
  ensureSheet_(ss, DESK.assignments, ['課題ID', '課題テーマ', '成果物', '評価観点', '提出方法', '受付状況', '表示順'], DEFAULT_ASSIGNMENTS);
  ensureSheet_(ss, DESK.submissions, ['課題ID', '学籍番号', '氏名', '学校メール', '提出URL', '最終提出日時', '再提出回数', '状態', '最新messageId']);
  ensureSheet_(ss, DESK.ledger, ['messageId', 'threadId', '受信日時', '提出キー', '処理結果', '理由', '提出一覧行']);
  ensureSheet_(ss, DESK.review, ['受信日時', '送信者', '件名', '要確認理由', 'messageId']);
  ensureSheet_(ss, DESK.errors, ['実行日時', 'エラー概要', 'stack']);
}

function ensureSheet_(ss, name, headers, seed) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() !== 0) return sheet;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#172137').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setFrozenRows(1);
  if (seed) sheet.getRange(2, 1, seed.length, seed[0].length).setValues(seed);
  sheet.autoResizeColumns(1, headers.length);
  return sheet;
}

function messageIds_(sheet) {
  return new Set(sheet.getDataRange().getValues().slice(1).map(function(row) { return String(row[0]); }));
}

function log_(ss, message, key, result, reason, row) {
  ss.getSheetByName(DESK.ledger).appendRow([message.getId(), message.getThread().getId(), new Date(), key, result, reason, row]);
}

function emailAddress_(from) {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim().toLowerCase();
}
