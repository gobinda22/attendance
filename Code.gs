/**
 * ATTENDANCE REGISTER — Google Sheets backend
 * ---------------------------------------------
 * Paste this whole file into Extensions > Apps Script (inside your
 * Google Sheet), then deploy it as a Web App. Full setup steps are
 * in the message that came with this file.
 *
 * It stores everything in four tabs on THIS spreadsheet:
 *   Students, Subjects, Attendance, Settings
 * The tabs are created automatically the first time the app talks
 * to this script — you don't need to create them by hand.
 */

const SHEET_NAMES = {
  students: 'Students',
  subjects: 'Subjects',
  attendance: 'Attendance',
  settings: 'Settings'
};

function getSS(){
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(name, headers){
  const ss = getSS();
  let sh = ss.getSheetByName(name);
  if(!sh){
    sh = ss.insertSheet(name);
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function ensureSheets(){
  getOrCreateSheet(SHEET_NAMES.students, ['id','roll','name']);
  getOrCreateSheet(SHEET_NAMES.subjects, ['id','code','name']);
  getOrCreateSheet(SHEET_NAMES.attendance, ['date','subjectId','type','studentId','present']);
  getOrCreateSheet(SHEET_NAMES.settings, ['key','value']);
}

// ---- reading ----

function sheetToObjects(sh){
  const values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  const headers = values[0];
  return values.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h,i) => obj[h] = row[i]);
      return obj;
    });
}

function formatDateVal(v){
  if(Object.prototype.toString.call(v) === '[object Date]'){
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v);
}

function getAllData(){
  const ss = getSS();
  const students = sheetToObjects(ss.getSheetByName(SHEET_NAMES.students))
    .map(s => ({ id: String(s.id), roll: String(s.roll), name: String(s.name) }));
  const subjects = sheetToObjects(ss.getSheetByName(SHEET_NAMES.subjects))
    .map(s => ({ id: String(s.id), code: String(s.code || ''), name: String(s.name) }));
  const attendanceRows = sheetToObjects(ss.getSheetByName(SHEET_NAMES.attendance));
  const settingsRows = sheetToObjects(ss.getSheetByName(SHEET_NAMES.settings));

  const settings = {};
  settingsRows.forEach(r => { settings[String(r.key)] = r.value === undefined ? '' : String(r.value); });

  const sessionsMap = {};
  attendanceRows.forEach(r => {
    const date = formatDateVal(r.date);
    const subjectId = String(r.subjectId);
    const type = String(r.type);
    const key = date + '__' + subjectId + '__' + type;
    if(!sessionsMap[key]){
      sessionsMap[key] = { id: key, date: date, subjectId: subjectId, type: type, records: {} };
    }
    const presentVal = r.present;
    const isPresent = presentVal === true || presentVal === 'Y' || presentVal === 'TRUE' || presentVal === 'true' || presentVal === 1;
    sessionsMap[key].records[String(r.studentId)] = isPresent;
  });

  return {
    ok: true,
    students: students,
    subjects: subjects,
    sessions: Object.keys(sessionsMap).map(k => sessionsMap[k]),
    settings: settings
  };
}

// ---- writing ----

function writeObjects(sh, headers, rows){
  sh.clearContents();
  const totalRows = Math.max(rows.length + 1, 2);
  sh.getRange(1, 1, totalRows, headers.length).setNumberFormat('@'); // keep everything as plain text
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  if(rows.length){
    const values = rows.map(r => headers.map(h => (r[h] === undefined || r[h] === null) ? '' : String(r[h])));
    sh.getRange(2, 1, values.length, headers.length).setValues(values);
  }
  sh.setFrozenRows(1);
}

function saveAllData(body){
  const ss = getSS();
  writeObjects(ss.getSheetByName(SHEET_NAMES.students), ['id','roll','name'], body.students || []);
  writeObjects(ss.getSheetByName(SHEET_NAMES.subjects), ['id','code','name'], body.subjects || []);

  const attendanceRows = [];
  (body.sessions || []).forEach(s => {
    const records = s.records || {};
    Object.keys(records).forEach(studentId => {
      attendanceRows.push({
        date: s.date, subjectId: s.subjectId, type: s.type,
        studentId: studentId, present: records[studentId] ? 'Y' : 'N'
      });
    });
  });
  writeObjects(ss.getSheetByName(SHEET_NAMES.attendance), ['date','subjectId','type','studentId','present'], attendanceRows);

  const settingsObj = body.settings || {};
  const settingsRows = Object.keys(settingsObj).map(k => ({ key: k, value: settingsObj[k] }));
  writeObjects(ss.getSheetByName(SHEET_NAMES.settings), ['key','value'], settingsRows);
}

function backupSpreadsheet(){
  const ss = getSS();
  const file = DriveApp.getFileById(ss.getId());
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH-mm');
  const copy = file.makeCopy(ss.getName() + ' — backup ' + stamp);
  return copy.getUrl();
}

// ---- HTTP entry points ----

function jsonOut(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e){
  try{
    ensureSheets();
    const action = (e && e.parameter && e.parameter.action) || 'getAll';
    if(action === 'ping'){
      return jsonOut({ ok: true, sheet: getSS().getName() });
    }
    return jsonOut(getAllData());
  }catch(err){
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doPost(e){
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try{
    ensureSheets();
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if(action === 'saveAll'){
      saveAllData(body);
      return jsonOut({ ok: true });
    }
    if(action === 'backup'){
      const url = backupSpreadsheet();
      return jsonOut({ ok: true, url: url });
    }
    if(action === 'ping'){
      return jsonOut({ ok: true, sheet: getSS().getName() });
    }
    return jsonOut({ ok: false, error: 'Unknown action: ' + action });
  }catch(err){
    return jsonOut({ ok: false, error: String(err) });
  }finally{
    lock.releaseLock();
  }
}
