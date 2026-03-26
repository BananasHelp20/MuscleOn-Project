const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Aktueller Modus: 'live' oder 'batch'
let currentMode = 'live';
let batchData = [];

// ─── API Endpunkte für ESP32 ───────────────────────────────────────────────

// ESP32 fragt den aktuellen Modus ab
app.get('/api/mode', (req, res) => {
  res.json({ mode: currentMode });
});

// Live-Modus: ESP32 sendet Daten laufend
app.post('/api/stream', (req, res) => {
  const data = req.body;
  console.log('Daten empfangen:', data); 
  // Daten sofort per WebSocket an alle Browser weiterschicken
  io.emit('emg-data', data);
  res.sendStatus(200);
});

// Batch-Modus: ESP32 sendet Daten am Ende der Einheit
app.post('/api/report', (req, res) => {
  const data = req.body;
  batchData = data.samples || [];
  // Browser über fertigen Bericht informieren
  io.emit('emg-report', { samples: batchData, timestamp: new Date() });
  res.sendStatus(200);
});

// ─── API Endpunkte für Browser ─────────────────────────────────────────────

// Modus vom Browser aus setzen
app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'live' || mode === 'batch') {
    currentMode = mode;
    batchData = [];
    console.log(`Modus geändert: ${mode}`);
    io.emit('mode-changed', { mode });
    res.json({ success: true, mode });
  } else {
    res.status(400).json({ error: 'Ungültiger Modus' });
  }
});

// ─── WebSocket ─────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Browser verbunden:', socket.id);
  // Aktuellen Modus direkt beim Verbinden schicken
  socket.emit('mode-changed', { mode: currentMode });

  socket.on('disconnect', () => {
    console.log('Browser getrennt:', socket.id);
  });
});

// ─── Server starten ────────────────────────────────────────────────────────

server.listen(PORT, '0.0.0.0', () => {
  console.log(`EMG Server läuft auf http://0.0.0.0:${PORT}`);
});
