const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Helper ────────────────────────────────────────────────────────────────

function userToJson(user) {
  return {
    userId: user.id,
    username: user.username,
    passwd: user.passwd,
    userMail: user.userMail,
    weight: user.weight,
    size: user.size,
    birthday: user.birthday,
    sessionTimes: JSON.parse(user.sessionTimes || '[]'),
    additionalSessions: JSON.parse(user.additionalSessions || '[]'),
    userSettings: JSON.parse(user.userSettings || '{}')
  };
}

// ─── User API ──────────────────────────────────────────────────────────────

// Alle User laden
app.get('/api/getData/all', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json({ users: users.map(userToJson) });
});

// Einen User laden
app.get('/api/getData/:userId', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User nicht gefunden' });
  res.json({ users: [userToJson(user)] });
});

// Neuen User hinzufügen
app.post('/api/addUser', (req, res) => {
  const { username, passwd, userMail, weight, size, birthday } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO users (username, passwd, userMail, weight, size, birthday)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, passwd || '', userMail || '', weight || 0, size || 0, birthday || '');
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.json(userToJson(newUser));
  } catch (err) {
    res.status(400).json({ error: 'Username bereits vergeben' });
  }
});

// User aktualisieren
app.post('/api/updateUser/:userId', (req, res) => {
  const { username, passwd, userMail, weight, size, birthday, sessionTimes, additionalSessions } = req.body;
  db.prepare(`
    UPDATE users SET
      username = ?,
      passwd = ?,
      userMail = ?,
      weight = ?,
      size = ?,
      birthday = ?,
      sessionTimes = ?,
      additionalSessions = ?
    WHERE id = ?
  `).run(
    username, passwd, userMail, weight, size, birthday,
    JSON.stringify(sessionTimes || []),
    JSON.stringify(additionalSessions || []),
    req.params.userId
  );
  res.json({ success: true });
});

// Alle User auf einmal speichern
app.post('/api/updateData', (req, res) => {
  const { users } = req.body;
  for (const user of users) {
    db.prepare(`
      UPDATE users SET
        username = ?,
        passwd = ?,
        userMail = ?,
        weight = ?,
        size = ?,
        birthday = ?,
        sessionTimes = ?,
        additionalSessions = ?
      WHERE id = ?
    `).run(
      user.username, user.passwd, user.userMail,
      user.weight, user.size, user.birthday,
      JSON.stringify(user.sessionTimes || []),
      JSON.stringify(user.additionalSessions || []),
      user.userId
    );
  }
  res.json({ success: true });
});

// User Einstellungen speichern
app.post('/api/saveSettings/:userId', (req, res) => {
  const settings = req.body;
  db.prepare('UPDATE users SET userSettings = ? WHERE id = ?')
    .run(JSON.stringify(settings), req.params.userId);
  res.json({ success: true });
});

// ─── EMG API ───────────────────────────────────────────────────────────────

let currentMode = 'live';
let currentSessionId = null;

app.get('/api/mode', (req, res) => {
  res.json({ mode: currentMode });
});

app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'live' || mode === 'batch') {
    currentMode = mode;
    io.emit('mode-changed', { mode });
    res.json({ success: true, mode });
  } else {
    res.status(400).json({ error: 'Ungültiger Modus' });
  }
});

// Session starten
app.post('/api/session/start', (req, res) => {
  const { userId, mode } = req.body;
  const result = db.prepare('INSERT INTO sessions (user_id, mode) VALUES (?, ?)')
    .run(userId, mode || currentMode);
  currentSessionId = result.lastInsertRowid;
  io.emit('session-started', { sessionId: currentSessionId });
  res.json({ success: true, sessionId: currentSessionId });
});

// Session beenden
app.post('/api/session/stop', (req, res) => {
  currentSessionId = null;
  io.emit('session-stopped');
  res.json({ success: true });
});

// Live Daten vom ESP32
app.post('/api/stream', (req, res) => {
  const data = req.body;
  if (currentSessionId) {
    db.prepare('INSERT INTO emg_readings (session_id, raw, adjusted, normalized) VALUES (?, ?, ?, ?)')
      .run(currentSessionId, data.raw, data.adjusted, data.normalized);
  }
  io.emit('emg-data', data);
  res.sendStatus(200);
});

// Batch Bericht vom ESP32
app.post('/api/report', (req, res) => {
  const { samples } = req.body;
  if (currentSessionId && samples) {
    for (const sample of samples) {
      db.prepare('INSERT INTO emg_readings (session_id, raw, adjusted, normalized) VALUES (?, ?, ?, ?)')
        .run(currentSessionId, sample.raw, sample.adjusted, sample.normalized);
    }
  }
  io.emit('emg-report', { samples, timestamp: new Date() });
  res.sendStatus(200);
});

// ─── WebSocket ─────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Browser verbunden:', socket.id);
  socket.emit('mode-changed', { mode: currentMode });
  socket.on('disconnect', () => {
    console.log('Browser getrennt:', socket.id);
  });
});

// ─── Server starten ────────────────────────────────────────────────────────

server.listen(PORT, '0.0.0.0', () => {
  console.log(`EMG Server läuft auf http://0.0.0.0:${PORT}`);
});
