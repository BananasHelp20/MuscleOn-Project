#include <Arduino.h>
#include "calibrations.h"

float smooth(float smooth, int raw, float wieght) {
  float newSmooth = (wieght * raw) + ((1 - wieght) * smooth);
  return newSmooth;
}

float generateBaseLine() {
  Serial.println("Relax muscle to set baseline... You have 3 seconds.");
  delay(1000);
  
  return readMedianOverTime(2000, 5);
}

float generateMaxValue() {
  Serial.println("Contract muscle to set max value... You have 3 seconds.");
  delay(1000);
  
  return readMedianOverTime(2000, 5);
}

float readMedianOverTime(int durationMs, int sampleIntervalMs) {
  int sampleCount = durationMs / sampleIntervalMs;
  float* samples = new float[sampleCount];
  float median = 0.0;

  for (int i = 0; i < sampleCount; i++) {
    int sampleRaw = analogRead(EMG_PIN);
    samples[i] = sampleRaw;
    delay(sampleIntervalMs);
  }

  std::sort(samples, samples + sampleCount);
  median = (samples[sampleCount / 2 - 1] + samples[sampleCount / 2]) / 2.0;

  return median;
}