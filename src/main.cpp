#include <Arduino.h>
#include "calibrations.h"

static int iteration = 0;
static float smoothedValue = 0.0;
static float baseline = 0.0;
static float maxValue = 0.0;

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);        // 0–4095
  analogSetAttenuation(ADC_11db);  // up to ~3.3V
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
  Serial.print("Raw (smoothed): ");
  Serial.print(smoothedValue, 0);
  Serial.print(" | Baseline-Adjusted: ");
  Serial.print(smoothedValue - baseline, 0);
  Serial.print(" | Normalized: ");
  Serial.println((smoothedValue - baseline) / (maxValue - baseline), 2);
}
