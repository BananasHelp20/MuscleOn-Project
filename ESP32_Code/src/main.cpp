#include <Arduino.h>
#include "calibrations.h"
#include <WiFi.h>
#include <HTTPClient.h>

static int iteration = 0;
static float smoothedValue = 0.0;
static float baseline = 0.0;
static float maxValue = 0.0;

const char* ssid = "EMG-Sensor";
const char* password = "emgsenso";
const char* serverUrl = "http://192.168.4.1:3000/api/stream";

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  Serial.println("Scanne WLANs...");
  int n = WiFi.scanNetworks();
  for (int i = 0; i < n; i++) {
    Serial.println(WiFi.SSID(i));
  }

  WiFi.begin(ssid);
  Serial.print("Verbinde mit WLAN");
  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 20) {
    delay(500);
    Serial.print(".");
    Serial.print(WiFi.status());
    timeout++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nVerbunden! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nVerbindung fehlgeschlagen! Status: " + String(WiFi.status()));
  }
}

void loop() {
  iteration++;
  int raw = analogRead(EMG_PIN);
  smoothedValue = smooth(smoothedValue, raw, 0.1);

  if (iteration % 50 == 0) {  // alle 50 * 5ms = 250ms
    printValues();
  }

  delay(5);
}

void printValues() {
  float raw_s = smoothedValue;
  float adjusted = smoothedValue - baseline;
  float normalized = 0.0;
  
  if ((maxValue - baseline) != 0) {
    normalized = (smoothedValue - baseline) / (maxValue - baseline);
  }

  Serial.print("Raw: "); Serial.print(raw_s, 0);
  Serial.print(" | Adjusted: "); Serial.print(adjusted, 0);
  Serial.print(" | Normalized: "); Serial.println(normalized, 2);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"raw\":" + String(raw_s, 0) + ",";
    json += "\"adjusted\":" + String(adjusted, 0) + ",";
    json += "\"normalized\":" + String(normalized, 2);
    json += "}";

    http.POST(json);
    http.end();
  }
}