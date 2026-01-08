#include <Arduino.h>
#define EMG_PIN 34

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);        // 0–4095
  analogSetAttenuation(ADC_11db);  // up to ~3.3V
}

void loop() {
  int raw = analogRead(EMG_PIN);
  float voltage = raw * (3.3 / 4095.0);

  Serial.print("Raw: ");
  Serial.print(raw);
  Serial.print("  Voltage: ");
  Serial.println(voltage, 3);

  delay(50);
}
