#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "calibrations.h"

const char* ssid = "ESP32toPython";
const char* password = "12345678";
const char* server = "http://10.136.219.86:8000/emg";

static int iteration = 0;
static float smoothedValue = 0.0;
static float baseline = 0.0;
static float maxValue = 0.0;

void setup() {
  Serial.begin(115200);

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());
}

void loop() {

  static bool started = false;
  iteration++;

  int raw = analogRead(EMG_PIN);
  smoothedValue = smooth(smoothedValue, raw, 0.1);

  if (!started) {
    if (smoothedValue > 600.0) {
      baseline = generateBaseLine();
      maxValue = generateMaxValue();
      started = true;
    }
  } 
  else {
    if (iteration % 50 == 1) {
      sendValues();
    }
  }

  delay(5);
}

void sendValues() {

  float adjusted = smoothedValue - baseline;
  float normalized = (smoothedValue - baseline) / (maxValue - baseline);

  Serial.print("Raw: ");
  Serial.print(smoothedValue);
  Serial.print(" Adjusted: ");
  Serial.print(adjusted);
  Serial.print(" Normalized: ");
  Serial.println(normalized);

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    String url = String(server) +
      "?raw=" + String(smoothedValue) +
      "&adj=" + String(adjusted) +
      "&norm=" + String(normalized);

    http.begin(url);
    http.GET();
    http.end();
  }
}