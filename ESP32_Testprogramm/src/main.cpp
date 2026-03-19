#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "calibrations.h"

const char* ssid = "ESP32toPython";
const char* password = "12345678";
const char* server = "http://10.136.219.86:8000/emg";

static int iteration = 0;
static float baseline = 0.0;
static float smoothedMuscleValue = 0.0;
static float maxMuscleValue = 0.0;

static float currentHeartRate = 0.0;
static float averageHeartRate = 0.0;
static float maxHeartRate = 0.0;

static float currentOxygenSaturation = 0.0;
static float averageOxygenSaturation = 0.0;


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
  smoothedMuscleValue = smooth(smoothedMuscleValue, raw, 0.1);

  if (!started) {
    if (smoothedMuscleValue > 600.0) {
      baseline = generateBaseLine();
      maxMuscleValue = generateMaxValue();
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

  float adjusted = smoothedMuscleValue - baseline;
  float normalized = (smoothedMuscleValue - baseline) / (maxMuscleValue - baseline);

  Serial.print("Raw: ");
  Serial.print(smoothedMuscleValue);
  Serial.print(" Adjusted: ");
  Serial.print(adjusted);
  Serial.print(" Normalized: ");
  Serial.println(normalized);

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    String url = String(server) +
      "?raw=" + String(smoothedMuscleValue) +
      "&adj=" + String(adjusted) +
      "&norm=" + String(normalized);

    http.begin(url);
    http.GET();
    http.end();
  }
}