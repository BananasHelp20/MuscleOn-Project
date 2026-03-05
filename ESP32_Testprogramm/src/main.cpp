#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "ESP32toPython";
const char* password = "12345678";

const char* server = "http://10.136.219.86:8000/data";

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected to WiFi");
  Serial.println(WiFi.localIP());
}

void loop() {

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    String url = String(server) + "?value=123";

    http.begin(url);
    int httpCode = http.GET();

    Serial.print("HTTP response: ");
    Serial.println(httpCode);

    http.end();
  }

  delay(5000);
}