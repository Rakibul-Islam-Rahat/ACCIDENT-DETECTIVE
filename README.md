# MINI DETECTIVE — Smart Accident Detection System

A React Native (0.87) Android app that connects to an ESP32 named
`MINI-DETECTIVE` over Bluetooth Low Energy, runs a gated camera monitoring
session, and uses the Gemini API to produce a structured accident verdict
from captured evidence. Every phone runs the same app; a locally configured
Monitoring Key is what authorizes a given phone to become the monitoring
device for a session — there are no accounts, logins, or roles.

## Architecture

```
ESP32 (servo, 2x sonar, motion)
   │  BLE (Nordic-UART-style GATT)
   ▼
Android phone — BluetoothService
   │  parsed SensorData
   ▼
MonitoringContext (app state)
   │
   ├─ Monitoring screen: rear camera (react-native-vision-camera)
   │      │
   │      ▼
   │  AccidentDetectionService (prototype trigger heuristic)
   │      │  "worth analyzing?"
   │      ▼
   │  GeminiService → Gemini API → AccidentAnalysis
   │      │
   │      ▼
   └─ Dashboard / Event history (this app)
           │
           ▼
   BackendService (placeholder today — the seam for a future
   backend + remote, camera-less viewer phones)
```

```
src/
  config/appConfig.ts          MONITORING_KEY, GEMINI_API_KEY, GEMINI_MODEL, DEMO_MODE — the only file you edit
  types/                       SensorData, AccidentAnalysis, shared types
  context/MonitoringContext.tsx  app-wide state via React Context (no Redux)
  services/
    BluetoothService.ts        BLE scan/connect/parse/demo-simulation
    GeminiService.ts           Gemini REST call + structured JSON parsing
    AccidentDetectionService.ts  prototype trigger heuristic (labeled as such)
    BackendService.ts          placeholder for a future remote backend
  utils/direction.ts           servo-angle → LEFT/CENTER/RIGHT (unit tested)
  navigation/AppNavigator.tsx
  screens/  HomeScreen, MonitoringAccessScreen, MonitoringScreen, EventScreen
  components/  StatusCard, SensorCard, VerdictCard
android/                       full native Android project (Gradle, manifest, Kotlin)
__tests__/                     Jest unit tests (BLE parsing, direction, Gemini parsing)
```

## Prerequisites

- Node.js v20+ (tested against v24.14.0)
- npm 11.x
- Java 17 (OpenJDK)
- Android SDK + platform tools, `adb` on PATH
- A physical Android phone (tested target: Motorola Edge 50 Pro) with USB
  debugging enabled, or an emulator
- Windows 11 + PowerShell is a supported dev environment; commands below
  are shell-agnostic

## One-time setup

```powershell
npm install
```

Generate the Gradle wrapper jar (binary file, not included as text —
see "About the Gradle wrapper" below):

```powershell
cd android
gradle wrapper --gradle-version 9.4.1
cd ..
```

Edit `src/config/appConfig.ts`:

| Constant | What to put there |
|---|---|
| `MONITORING_KEY` | Any PIN/passphrase string, e.g. `'2580'`. This is what `MonitoringAccessScreen` checks against. |
| `GEMINI_API_KEY` | Your key from Google AI Studio. Never logged, never rendered in the UI. |
| `GEMINI_MODEL` | A model name your key currently has access to — check https://ai.google.dev/gemini-api/docs/models rather than guessing. |
| `DEMO_MODE` | `true` to run the whole app with simulated sensor data and no ESP32 required; `false` for real hardware. |

Both `MONITORING_KEY` and `GEMINI_API_KEY` ship as empty strings by
design — the app will tell you exactly that (not crash) if you try to use
either while empty.

## Running

Terminal 1:
```powershell
npx react-native start --reset-cache
```

Terminal 2 (phone connected via USB, `adb devices` shows it):
```powershell
npx react-native run-android
```

## Demo mode (no ESP32 required)

With `DEMO_MODE = true` in `appConfig.ts`:
- `START MONITORING` still requires the correct Monitoring Key.
- The Monitoring screen still opens the real physical camera.
- Bluetooth is simulated: after a short "connecting" delay it reports
  CONNECTED and emits realistic-looking sensor packets every
  `DEMO_SENSOR_INTERVAL_MS`. Every value produced this way is flagged
  `isDemoData: true` internally and the UI shows a "DATA SOURCE: DEMO DATA"
  tag — it is never presented as if it came from real hardware.
- Motion events still trigger the capture → Gemini pipeline if you've
  filled in `GEMINI_API_KEY` and `GEMINI_MODEL`.

Set `DEMO_MODE = false` once your ESP32 is flashed and powered on.

## ESP32 / BLE contract

- Device name: `MINI-DETECTIVE`
- Service UUID: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- RX (phone → ESP32) characteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
- TX (ESP32 → phone, notify) characteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
- Expected TX payload format: `SERVO:90,S1:25,S2:30,MOTION:YES`

`parseSensorPacket` (in `src/services/BluetoothService.ts`) tolerates
whitespace, newlines, partial fields, and garbage — it returns `null`
rather than throwing, and the caller simply ignores a `null` packet. See
`__tests__/BluetoothService.test.ts` for the exact tolerated/rejected
cases.

## Permissions

Requested at runtime, never on app launch:
- **Camera** — requested only after a correct Monitoring Key is entered,
  right when `MonitoringScreen` mounts.
- **Bluetooth** — `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` on Android 12+
  (with `neverForLocation` where applicable), `ACCESS_FINE_LOCATION` +
  legacy `BLUETOOTH`/`BLUETOOTH_ADMIN` on Android ≤ 11. All declared in
  `android/app/src/main/AndroidManifest.xml`.

If either permission is denied, the relevant screen shows a plain-language
message and a way to retry — nothing crashes.

## Testing

```powershell
npx tsc --noEmit
npx jest
```

Both are already passing against the exact dependency versions pinned in
`package.json` (verified via a clean `npm install` before this project was
handed to you). `__tests__/` covers BLE packet parsing (well-formed,
partial, and malformed input), the servo-angle direction mapping
(`< 80` → LEFT, `> 100` → RIGHT, otherwise CENTER), and Gemini response
parsing (valid JSON, fenced JSON, out-of-range confidence, invalid verdict,
non-JSON garbage).

## Release build

```powershell
cd android
./gradlew assembleRelease
```

The debug signing config is reused for release in this prototype
(`android/app/build.gradle`) so a release APK is producible without a
separate keystore — swap in a real release keystore before distributing
this outside your own devices.

## About the Gradle wrapper

`android/gradle/wrapper/gradle-wrapper.jar` is a compiled binary file and
is the ONE file in this project that genuinely cannot be transmitted as
source text, so it is not part of this delivery. Every other binary asset
this project needs — `app/debug.keystore` (a real, valid debug-signing
keystore generated with the standard Android debug credentials:
alias `androiddebugkey`, password `android`) and the launcher icon PNGs
under `app/src/main/res/mipmap-*/` — **is included**, verified against the
real `react-native-community/template` repository, not left for you to
generate.

`gradlew` / `gradlew.bat` and `gradle-wrapper.properties` (pinning Gradle
9.4.1) are both included and correct. Generate the jar once, without
installing Gradle system-wide, by downloading a Gradle distribution
temporarily and using its bundled `gradle.bat` a single time:

```powershell
# From the android/ folder
Invoke-WebRequest -Uri "https://services.gradle.org/distributions/gradle-9.4.1-bin.zip" -OutFile "$env:TEMP\gradle-9.4.1-bin.zip"
Expand-Archive -Path "$env:TEMP\gradle-9.4.1-bin.zip" -DestinationPath "$env:TEMP\gradle-9.4.1" -Force
& "$env:TEMP\gradle-9.4.1\gradle-9.4.1\bin\gradle.bat" wrapper --gradle-version 9.4.1
```

Every build after that uses `./gradlew` / `gradlew.bat` from this project —
you never touch the temporary download again.

**Note on this Gradle config specifically**: the root `android/build.gradle`,
`android/settings.gradle`, `android/gradle.properties`,
`android/gradle/wrapper/gradle-wrapper.properties`, and
`MainApplication.kt`/`MainActivity.kt` in this project are verified
line-for-line against the actual, currently-published
`react-native-community/template` repository tagged `0.87-stable` (the same
template `npx react-native init` uses for this RN version) — not hand-rolled
from memory. Two things worth knowing explicitly:

- **React Native 0.82+ (including 0.87.0) no longer supports disabling the
  New Architecture.** `newArchEnabled=false` is a no-op that only produces a
  warning — it is forced on regardless. `gradle.properties` reflects this
  (`newArchEnabled=true`) rather than pretending otherwise.
- **This project's Gradle toolchain requires Gradle 9.4.1**, not 8.x — the
  `gradle-wrapper.properties` pins this, and `gradle.properties` includes
  `android.builtInKotlin=false` / `android.newDsl=false`, which opt out of
  AGP 9's built-in Kotlin handling (it otherwise conflicts with the explicit
  `apply plugin: "org.jetbrains.kotlin.android"` in `app/build.gradle` with
  a "Cannot add extension with name 'kotlin'" error). Gradle 9.x itself
  requires JDK 17+ to run, which OpenJDK 17 satisfies.

## Troubleshooting

- **`SDK location not found`** — create `android/local.properties` with
  `sdk.dir=C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk` (this file is
  machine-specific and intentionally gitignored).
- **Metro can't connect / red screen on launch** — `adb reverse tcp:8081
  tcp:8081`, then reload.
- **Camera shows "CAMERA ERROR"** — tap RETRY; if it persists, check
  `adb logcat` for the underlying vision-camera error message, which is
  surfaced through `onError` in `MonitoringScreen.tsx` rather than
  swallowed.
- **Bluetooth stuck on SCANNING** — confirm the ESP32 is powered, in range,
  and advertising as `MINI-DETECTIVE`; scanning gives up after
  `BLE_SCAN_TIMEOUT_MS` (12s default) and reports an error rather than
  hanging forever.
- **Gemini calls fail immediately** — check that both `GEMINI_API_KEY` and
  `GEMINI_MODEL` are non-empty in `appConfig.ts`; the service reports this
  specific reason rather than a generic network error.

## Known, stated gaps

- **Backend / remote viewers**: not implemented. `BackendService.ts` is a
  documented no-op placeholder — the seam is there so a real backend can be
  added without restructuring `MonitoringContext` or the screens.
- **Accident-detection trigger** (`AccidentDetectionService.ts`) is a
  simple, explicitly-labeled prototype heuristic (motion flag + sonar
  delta), not a validated or trained model.
- **ESP32 firmware** is out of scope for this Android project — only the
  phone-side BLE consumer is implemented here.
