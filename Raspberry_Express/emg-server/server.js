const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Bluetooth Serial öffnen
const port = new SerialPort({
  path: "/dev/rfcomm0",
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (data) => {
  console.log("EMG:", data);
  io.emit("emg", data); // an Website senden
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Server läuft auf Port 3000");
});
