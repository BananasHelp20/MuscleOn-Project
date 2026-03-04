#include <Arduino.h>
#include "calibrations.h"
#include <BluetoothSerial.h>

static int iteration = 0;
static float smoothedValue = 0.0;
static float baseline = 0.0;
static float maxValue = 0.0;
BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  SerialBT.begin("ESP32_EMG");
  
  analogReadResolution(12);        // 0–4095
  analogSetAttenuation(ADC_11db);  // up to ~3.3V

  Serial.println("ESP32 ready");
  SerialBT.println("ESP32 ready");
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
  } else {
    if (iteration % 50 == 1) {
      printValues();
    }
  }

  delay(5);
}

void printValues() {
  SerialBT.print("Raw (smoothed): ");
  SerialBT.print(smoothedValue, 0);
  SerialBT.print(" | Baseline-Adjusted: ");
  SerialBT.print(smoothedValue - baseline, 0);
  SerialBT.print(" | Normalized: ");
  SerialBT.println((smoothedValue - baseline) / (maxValue - baseline), 2);
}
