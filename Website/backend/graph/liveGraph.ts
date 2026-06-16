import WebSocket from 'ws';
import { Server as HttpServer } from 'http';
import { URL } from 'url';

/**
 * WebSocket Server für Live-Grafhdaten (Muskelrohdaten)
 */

interface MuscleClient extends WebSocket {
    isAlive?: boolean;
    clientId?: string;
}

interface ClientSession {
    clientId: string;
    ws: MuscleClient;
    connectedAt: Date;
    reconnectCount: number;
}

let wss: WebSocket.Server | null = null;
let dataGeneratorInterval: NodeJS.Timeout | null = null;
let currentMuscleUsage: number = 0;
let muscleDirection: number = 1; // 1 = increasing, -1 = decreasing
const muscleChangeRate: number = 50; // Änderungsrate pro Update
const minMuscleValue: number = 0;
const maxMuscleValue: number = 4500;
const updateInterval: number = 100; // Update alle 100ms

// Map um Client-IDs auf WebSocket-Verbindungen zu mappen
const clientSessions = new Map<string, ClientSession>();

// Timeout um verwaiste Sessions zu bereinigen (z.B. wenn Reconnect nicht innerhalb dieser Zeit stattfindet)
const CLIENT_TIMEOUT = 60000; // 60 Sekunden

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
            try {
                const urlObj = new URL(request.url!, `http://${request.headers.host}`);
                const pathname = urlObj.pathname;
                const clientId = urlObj.searchParams.get('clientId');

                if (pathname === '/ws/liveData') {
                    // console.log(`WebSocket Upgrade Request auf /ws/liveData (clientId: ${clientId})`);
                    
                    if (!clientId) {
                        console.warn('WebSocket Verbindung ohne clientId abgelehnt');
                        socket.destroy();
                        return;
                    }

                    wss!.handleUpgrade(request, socket, head, (ws) => {
                        wss!.emit('connection', ws, request, clientId);
                    });
                } else {
                    socket.destroy();
                }
            } catch (error) {
                console.error('Fehler beim Parsen der WebSocket URL:', error);
                socket.destroy();
            }
        });

        // Connection Handler
        wss.on('connection', (ws: MuscleClient, request: any, clientId: string) => {
            ws.clientId = clientId;

            // Prüfe ob Client bereits existiert
            if (clientSessions.has(clientId)) {
                const existingSession = clientSessions.get(clientId)!;
                // console.log(`✓ Reconnect erkannt für Client ${clientId} (Reconnect #${existingSession.reconnectCount + 1})`);
                
                // Alte Verbindung schließen (falls noch offen)
                if (existingSession.ws.readyState === WebSocket.OPEN) {
                    existingSession.ws.close();
                }

                // Ersetze alte Verbindung mit neuer
                existingSession.ws = ws;
                existingSession.reconnectCount++;
            } else {
                console.log(`✓ Neuer WebSocket Client verbunden. ClientId: ${clientId}. Aktuelle Clients: ${clientSessions.size}`);
                
                // Neue Session erstellen
                clientSessions.set(clientId, {
                    clientId: clientId,
                    ws: ws,
                    connectedAt: new Date(),
                    reconnectCount: 0
                });
            }
            
            ws.isAlive = true;

            // Heartbeat zum Überprüfen ob Clients noch verbunden sind
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            // Error Handler
            ws.on('error', (error) => {
                console.error(`WebSocket Error (${clientId}):`, error);
            });

            // Close Handler
            ws.on('close', () => {
                // console.log(`✗ WebSocket Client disconnect (${clientId}). Noch verbundene Clients: ${clientSessions.size}`);
                
                // Entferne Session nur, wenn diese Verbindung tatsächlich die aktuelle ist
                const session = clientSessions.get(clientId);
                if (session && session.ws === ws) {
                    // Verzögere das Löschen, um Reconnects innerhalb kurzer Zeit zu erlauben
                    setTimeout(() => {
                        const stillExistingSession = clientSessions.get(clientId);
                        if (stillExistingSession && stillExistingSession.ws === ws) {
                            clientSessions.delete(clientId);
                            console.log(`Session für ${clientId} nach ${CLIENT_TIMEOUT}ms gelöscht (kein Reconnect)`);
                        }
                    }, CLIENT_TIMEOUT);
                }
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
    if (clientSessions.size === 0) return;

    const data = {
        muscleUsage: muscleUsage,
        timestamp: new Date().toLocaleTimeString('de-DE')
    };

    const message = JSON.stringify(data);

    // Sende an alle verbundenen Clients
    clientSessions.forEach((session: ClientSession) => {
        if (session.ws.readyState === WebSocket.OPEN) {
            session.ws.send(message);
        }
    });
}

/**
 * Gibt die aktuellen Daten zurück (für HTTP Polling Fallback)
 */
export function getCurrentMuscleData(): object {
    const activeClients = Array.from(clientSessions.values()).filter(s => s.ws.readyState === WebSocket.OPEN).length;
    return {
        muscleUsage: currentMuscleUsage,
        timestamp: new Date().toLocaleTimeString('de-DE'),
        connectedClients: activeClients,
        totalSessions: clientSessions.size
    };
}

/**
 * Heartbeat um inaktive Clients zu identifizieren
 */
function startHeartbeat(): void {
    const heartbeatInterval = setInterval(() => {
        clientSessions.forEach((session: ClientSession) => {
            if (session.ws.isAlive === false) {
                session.ws.terminate();
            } else {
                session.ws.isAlive = false;
                if (session.ws.readyState === WebSocket.OPEN) {
                    session.ws.ping();
                }
            }
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

    // Schließe alle aktiven Sessions
    clientSessions.forEach((session: ClientSession) => {
        if (session.ws.readyState === WebSocket.OPEN) {
            session.ws.close();
        }
    });
    clientSessions.clear();

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
    const activeClients = Array.from(clientSessions.values()).filter(s => s.ws.readyState === WebSocket.OPEN).length;
    return {
        isRunning: wss !== null,
        activeClients: activeClients,
        totalSessions: clientSessions.size,
        currentMuscleUsage: currentMuscleUsage
    };
}

