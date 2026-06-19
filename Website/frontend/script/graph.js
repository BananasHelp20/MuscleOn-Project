// Live Graph für Muscle Usage über Zeit
let liveChart = null;
let chartDataPoints = [];
const MAX_DATA_POINTS = 50; // Maximale Anzahl von Datenpunkten im Graph
const UPDATE_INTERVAL = 50; // Update Interval in Millisekunden (100ms für schnellere Updates)
let updateTimeout = null;
let ws = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectDelay = 1000; // Startverzögerung für Reconnect in ms
let set = [{
                label: 'Raw Muscle Usage',
                data: [],
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: pointBackgroundColor,
                pointBorderColor: pointBorderColor,
                pointBorderWidth: 1,
                pointHoverRadius: 6
            }];


// Client-ID für WebSocket Session Tracking
let clientId = null;

/**
 * Generiert oder lädt eine eindeutige Client-ID
 */
function getOrCreateClientId() {
    const STORAGE_KEY = 'muscleOn_websocket_clientId';
    
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
        // Generiere eine neue eindeutige ID (UUID v4 Style)
        id = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(STORAGE_KEY, id);
        console.log('Neue Client-ID erstellt:', id);
    } else {
        console.log('Existierende Client-ID geladen:', id);
    }
    return id;
}

/**
 * Initialisiert den Live-Graph für Muscle Usage
 */
function initializeLiveGraph() {
    const chartContainer = document.getElementById('liveGraph');
    
    if (!chartContainer) {
        console.error('liveGraph Container nicht gefunden');
        return;
    }

    // Erstelle Canvas Element falls nicht vorhanden
    let canvas = chartContainer.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);
    }

    // Chart.js Konfiguration
    const ctx = canvas.getContext('2d');
    liveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: set
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#fff',
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Live Muscle Usage',
                    color: '#fff',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        stepSize: 500
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Muscle Usage',
                        color: '#fff'
                    }
                },
                x: {
                    ticks: {
                        color: '#fff',
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Zeit',
                        color: '#fff'
                    }
                }
            }
        }
    });

    // Starte die Daten-Updates vom Server
    startFetchingData();
}

/**
 * Fügt einen neuen Datenpunkt zum Graph hinzu
 * @param {number} muscleUsage - Muscle Usage Rohwert
 * @param {string} timestamp - Zeit im Format HH:MM:SS oder custom
 */
function addDataPoint(muscleUsage, timestamp = null) {
    if (!liveChart) {
        console.error('Chart nicht initialisiert');
        return;
    }

    // Generiere Timestamp falls nicht vorhanden
    if (!timestamp) {
        const now = new Date();
        timestamp = now.toLocaleTimeString('de-DE');
    }

    // Begrenzte Anzahl von Datenpunkten
    if (liveChart.data.labels.length >= MAX_DATA_POINTS) {
        liveChart.data.labels.shift();
        liveChart.data.datasets[0].data.shift();
    }

    // Füge neue Daten hinzu
    liveChart.data.labels.push(timestamp);
    liveChart.data.datasets[0].data.push(muscleUsage);

    // Berechne die neue Y-Achsen max (500 größer als höchster Wert)
    updateYAxisMax();

    // Update Chart
    liveChart.update('none'); // 'none' verhindert Animation für flüssigere Updates
}

/**
 * Aktualisiert die Y-Achse max basierend auf den höchsten Datenpunkten
 */
function updateYAxisMax() {
    const data = liveChart.data.datasets[0].data;
    
    if (data.length === 0) {
        liveChart.options.scales.y.max = 500;
        return;
    }

    const maxValue = Math.max(...data);
    // Runde auf die nächste 500er Grenze auf
    const newMax = Math.ceil(maxValue / 500) * 500 + 500;
    
    liveChart.options.scales.y.max = newMax;
}

/**
 * Startet das Abrufen von Daten vom Server
 */
function startFetchingData() {
    // Initialisiere Client-ID für WebSocket Session Tracking
    clientId = getOrCreateClientId();
    
    // Versuche zuerst WebSocket, falls nicht verfügbar, nutze Polling
    if (window.WebSocket) {
        startWebSocketConnection();
    } else {
        startPollingData();
    }
}

/**
 * Verbindung zu WebSocket Server
 */
function startWebSocketConnection() {
    try {
        // Schließe alte Verbindung
        if (ws) {
            ws.close();
            ws = null;
        }

        // Passe die WebSocket URL an deine Server-Konfiguration an
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/liveData?clientId=${clientId}`;
        console.log(`WebSocket Connect mit ClientId: ${clientId}`);
        ws = new WebSocket(wsUrl);

        ws.onopen = function() {
            console.log('✓ WebSocket verbunden mit ClientId:', clientId);
            reconnectAttempts = 0;
            reconnectDelay = 1000; // Reset Reconnect Delay
        };

        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.muscleUsage !== undefined) {
                    addDataPoint(data.muscleUsage, data.timestamp);
                }
            } catch (e) {
                console.error('Fehler beim Parsen der WebSocket Daten:', e);
            }
        };

        ws.onerror = function(error) {
            console.error('✗ WebSocket Error (ClientId: ' + clientId + '):', error);
        };

        ws.onclose = function() {
            console.log('✗ WebSocket geschlossen (ClientId: ' + clientId + ')');
            ws = null;
            
            // Versuche Reconnection mit exponentiellem Backoff
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(`Reconnect Versuch ${reconnectAttempts}/${maxReconnectAttempts} für ClientId ${clientId} in ${reconnectDelay}ms`);
                setTimeout(startWebSocketConnection, reconnectDelay);
                reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Max 30 Sekunden
            } else {
                console.log('Max Reconnect Versuche erreicht. Wechsle zu Polling...');
                startPollingData();
            }
        };
    } catch (e) {
        console.error('WebSocket Fehler:', e);
        startPollingData();
    }
}

/**
 * Polling-Methode zum Abrufen von Daten vom Server
 */
function startPollingData() {
    console.log('Starte Daten-Polling (100ms Intervall)...');
    
    // Setze ein Update-Interval
    if (updateTimeout) {
        clearInterval(updateTimeout);
    }
    
    updateTimeout = setInterval(() => {
        fetchLiveData();
    }, UPDATE_INTERVAL);
}

/**
 * Ruft Live-Daten vom Server ab
 */
async function fetchLiveData() {
    try {
        // Passe den Endpoint an deine Server-Konfiguration an
        const response = await fetch('/api/liveData', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.muscleUsage !== undefined) {
            addDataPoint(data.muscleUsage, data.timestamp);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen der Live-Daten:', error);
    }
}

/**
 * Stoppt das Daten-Fetching
 */
function stopFetchingData() {
    if (updateTimeout) {
        clearInterval(updateTimeout);
        updateTimeout = null;
    }
    
    if (ws) {
        ws.close();
        ws = null;
    }
}

/**
 * Setzt den Graph zurück (löscht alle Daten)
 */
function resetLiveGraph() {
    if (liveChart) {
        liveChart.data.labels = [];
        liveChart.data.datasets[0].data = [];
        liveChart.update();
    }
}

/**
 * Manueller Test - fügt zufällige Testdaten hinzu
 */
function addTestData() {
    const randomMuscleUsage = Math.random() * 4500;
    addDataPoint(randomMuscleUsage);
}