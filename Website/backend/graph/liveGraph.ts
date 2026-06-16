import WebSocket from 'ws';
import { Server as HttpServer } from 'http';
import * as url from 'url';

/**
 * WebSocket Server für Live-Grafhdaten (Muskelrohdaten)
 */

interface MuscleClient extends WebSocket {
    isAlive?: boolean;
}

let wss: WebSocket.Server | null = null;
let dataGeneratorInterval: NodeJS.Timeout | null = null;
let currentMuscleUsage: number = 0;
let muscleDirection: number = 1; // 1 = increasing, -1 = decreasing
const muscleChangeRate: number = 50; // Änderungsrate pro Update
const minMuscleValue: number = 0;
const maxMuscleValue: number = 4500;
const updateInterval: number = 100; // Update alle 100ms

/**
 * Initialisiert den WebSocket Server für Live-Graph Daten
 * @param server - Express HTTP Server
 */
export function initializeGraphWebSocket(server: HttpServer): void {
    try {
        // Erstelle WebSocket Server mit noServer: true
        // Das bedeutet, dass wir manuell die Upgrades handhaben
        wss = new WebSocket.Server({ noServer: true });

        console.log('WebSocket Server initialisiert');

        // Upgrade Handler für HTTP Requests zu WebSocket
        server.on('upgrade', (request, socket, head) => {
            const pathname = url.parse(request.url!).pathname;

            if (pathname === '/ws/liveData') {
                console.log('WebSocket Upgrade Request auf /ws/liveData');
                wss!.handleUpgrade(request, socket, head, (ws) => {
                    wss!.emit('connection', ws, request);
                });
            } else {
                socket.destroy();
            }
        });

        // Connection Handler
        wss.on('connection', (ws: MuscleClient) => {
            console.log('Neuer WebSocket Client verbunden. Aktuelle Clients:', wss?.clients.size || 0);
            
            ws.isAlive = true;

            // Heartbeat zum Überprüfen ob Clients noch verbunden sind
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            // Error Handler
            ws.on('error', (error) => {
                console.error('WebSocket Error:', error);
            });

            // Close Handler
            ws.on('close', () => {
                console.log('WebSocket Client disconnect. Noch verbundene Clients:', wss?.clients.size || 0);
            });
        });

        // Starte Heartbeat
        startHeartbeat();

        // Starte Datengenerator
        startDataGenerator();

    } catch (error) {
        console.error('Fehler beim Initialisieren des WebSocket Servers:', error);
    }
}

/**
 * Startet die Datengenerator für Testdaten
 */
function startDataGenerator(): void {
    if (dataGeneratorInterval) {
        clearInterval(dataGeneratorInterval);
    }

    currentMuscleUsage = 0;
    muscleDirection = 1;

    dataGeneratorInterval = setInterval(() => {
        // Berechne nächsten Wert
        currentMuscleUsage += muscleDirection * muscleChangeRate;

        // Ändere Richtung wenn Min/Max erreicht
        if (currentMuscleUsage >= maxMuscleValue) {
            currentMuscleUsage = maxMuscleValue;
            muscleDirection = -1;
        } else if (currentMuscleUsage <= minMuscleValue) {
            currentMuscleUsage = minMuscleValue;
            muscleDirection = 1;
        }

        // Sende Daten an alle verbundenen Clients
        broadcastMuscleData(currentMuscleUsage);

    }, updateInterval);

    console.log('Datengenerator gestartet');
}

/**
 * Sendet Daten an alle verbundenen WebSocket Clients
 * @param muscleUsage - Muskelrohdaten Wert
 */
function broadcastMuscleData(muscleUsage: number): void {
    if (!wss) return;

    const data = {
        muscleUsage: muscleUsage,
        timestamp: new Date().toLocaleTimeString('de-DE')
    };

    const message = JSON.stringify(data);

    // Sende an alle verbundenen Clients
    wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

/**
 * Gibt die aktuellen Daten zurück (für HTTP Polling Fallback)
 */
export function getCurrentMuscleData(): object {
    return {
        muscleUsage: currentMuscleUsage,
        timestamp: new Date().toLocaleTimeString('de-DE'),
        connectedClients: wss?.clients.size || 0
    };
}

/**
 * Heartbeat um inaktive Clients zu identifizieren
 */
function startHeartbeat(): void {
    if (!wss) return;

    const heartbeatInterval = setInterval(() => {
        if (!wss) {
            clearInterval(heartbeatInterval);
            return;
        }

        wss.clients.forEach((ws: MuscleClient) => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000); // Ping alle 30 Sekunden
}

/**
 * Stoppt den WebSocket Server und Datengenerator
 */
export function stopGraphWebSocket(): void {
    if (dataGeneratorInterval) {
        clearInterval(dataGeneratorInterval);
        dataGeneratorInterval = null;
    }

    if (wss) {
        wss.close(() => {
            console.log('WebSocket Server geschlossen');
            wss = null;
        });
    }
}

/**
 * Gibt den Status des WebSocket Servers zurück
 */
export function getGraphWebSocketStatus(): object {
    return {
        isRunning: wss !== null,
        connectedClients: wss?.clients.size || 0,
        currentMuscleUsage: currentMuscleUsage
    };
}

