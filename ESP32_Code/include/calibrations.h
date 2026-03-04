#include <Arduino.h>

#ifndef CALIBRATIONS_H
#define CALIBRATIONS_H

// Constants
#define EMG_PIN 34

// Function Declarations
float smooth(float smooth, int raw, float wieght);
float generateBaseLine();
float generateMaxValue();
float readMedianOverTime(int durationMs, int sampleIntervalMs);
void printValues();

#endif
