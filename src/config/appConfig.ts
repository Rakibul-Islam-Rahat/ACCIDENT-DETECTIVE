/**
 * MINI DETECTIVE - Central configuration
 *
 * This is the ONLY file you should need to edit to configure secrets
 * and behavior for your own deployment.
 *
 * SECURITY NOTE:
 * In a production system, the Gemini API key must NEVER ship inside a
 * mobile app binary — it should live behind a backend proxy that holds
 * the key server-side and forwards analysis requests. For this student
 * prototype we accept a local, empty placeholder as documented by the
 * project spec. Do not commit a real key to source control.
 */

export const APP_NAME = 'MiniDetective';
export const APP_TITLE = 'MINI DETECTIVE';
export const APP_SUBTITLE = 'Smart Accident Detection System';

/**
 * The PIN/key required to activate Monitoring Mode on a phone.
 * This does NOT represent a "role" or "account" — it simply authorizes
 * whichever phone enters it correctly to act as the monitoring device
 * for this session. Change this before building a release APK.
 */
export const MONITORING_KEY: string = '50768';

/**
 * Gemini API key. Leave empty here and fill in locally.
 * Never print this value, log it, or render it in the UI.
 */
export const GEMINI_API_KEY: string = 'AQ.Ab8RN6JLnwkWV64-3VkRCIh3tViSDflB1XXOkAIyH7CjN-aLMw';

/**
 * Gemini model identifier to use for accident analysis.
 * Fill this in with a model you've confirmed is available for your
 * API key/tier (check https://ai.google.dev/gemini-api/docs/models
 * for current model names — do not assume one).
 */
export const GEMINI_MODEL: string = 'gemini-3.6-flash';

/**
 * When true, the app never requires real ESP32 hardware:
 * - BluetoothService can be asked to emit simulated SensorData
 * - the UI clearly labels this data as DEMO DATA
 * Set to false for real hardware runs.
 */
export const DEMO_MODE: boolean = false;

/** BLE identifiers — must match the ESP32 firmware. */
export const BLE_DEVICE_NAME = 'MINI-DETECTIVE';
export const BLE_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const BLE_RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
export const BLE_TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

/** BLE scan timeout in milliseconds before giving up and reporting disconnected. */
export const BLE_SCAN_TIMEOUT_MS = 12000;

/** How often (ms) the demo-mode simulator emits fake sensor packets. */
export const DEMO_SENSOR_INTERVAL_MS = 2000;
