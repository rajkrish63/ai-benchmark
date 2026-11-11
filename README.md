# PocketBench — On-Device LLM Benchmark for Android

<p align="center">
  <img src="assets/icon.png" width="96" height="96" alt="PocketBench Logo" />
</p>

<p align="center">
  <strong>An open, reproducible benchmark measuring real-world LLM inference on everyday Android devices.</strong><br />
  Evaluates decode speed, TTFT, peak RAM, battery drain, and thermal throttling across budget and mid-range hardware (4–8 GB RAM).
</p>

<p align="center">
  <a href="#install"><img src="https://img.shields.io/badge/Release-v1.0.0-D97757?style=flat-square" alt="Release v1.0.0" /></a>
  <a href="#architecture"><img src="https://img.shields.io/badge/React%20Native-0.77-black?style=flat-square" alt="React Native 0.77" /></a>
  <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-New%20Arch%20%2B%20Hermes-0A0A0A?style=flat-square" alt="New Arch + Hermes" /></a>
  <a href="#supported-models"><img src="https://img.shields.io/badge/Format-GGUF%20Quantized-1A1A1A?style=flat-square" alt="GGUF Format" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-262626?style=flat-square" alt="License MIT" /></a>
  <a href="#testing"><img src="https://img.shields.io/badge/Tests-Passing-22C55E?style=flat-square" alt="Tests Passing" /></a>
</p>

---

## Direct Download & Installation

The standalone signed release APK is packaged and ready to install directly from this repository:

### 📦 [Download PocketBench v1.0.0 Release APK (`release/PocketBench-v1.0.0-release.apk`)](./release/PocketBench-v1.0.0-release.apk)
*Size: ~53.1 MB | Target: Android 7.0+ (API 24 to 35) | Architectures: arm64-v8a, armeabi-v7a, x86, x86_64*

#### Installation Options:
1. **Direct on Phone**:
   - Download [`PocketBench-v1.0.0-release.apk`](./release/PocketBench-v1.0.0-release.apk) via browser.
   - Tap the downloaded APK to install (enable "Install unknown apps" if prompted).
   - Launch **PocketBench** from your app drawer.

2. **Via ADB**:
   ```bash
   adb install -r release/PocketBench-v1.0.0-release.apk
   adb shell am start -n com.pocketbenchapp/.MainActivity
   ```

---

## Why PocketBench Exists

Most published on-device AI benchmarks test flagship smartphones costing $1,200+ equipped with 12–16 GB of unified RAM and active cooling systems. 

However, over **80% of global smartphone users own budget and mid-range Android devices** with 4 GB to 8 GB of RAM and thermal-constrained SoCs (MediaTek Helio/Dimensity, Qualcomm Snapdragon 6/7 series, Samsung Exynos).

PocketBench was built to answer the questions that matter to real-world application developers:
- *Can a 4 GB RAM phone run a 1.5B parameter model without triggering Android low-memory-killer (OOM)?*
- *What is the real-world battery drain of running 100 tokens of on-device inference?*
- *How severely does sustained inference throttle decode tokens/sec after 3 minutes of execution?*
- *Which quantization level (Q4_K_M vs. Q4_0 vs. Q8_0) delivers the best tokens-per-second to memory footprint ratio?*

---

## What It Measures

| Metric | Measurement Method | Unit | Description |
|---|---|---|---|
| **Model Load Time** | High-precision native timestamp delta | `ms` | Time taken to mmap weights into memory and initialize model context |
| **Time to First Token (TTFT)** | Prompt ingestion to first token emitted | `ms` | Latency between sending the prompt and generation start |
| **Prefill Throughput** | Context tokens / prompt processing duration | `tok/s` | Ingestion speed for analyzing system prompts and input context |
| **Decode Throughput** | Output tokens / generation duration | `tok/s` | Token generation speed perceived by the end user |
| **Peak RAM (RSS)** | `ActivityManager.getProcessMemoryInfo` | `MB` | Maximum physical Resident Set Size occupied during inference |
| **Battery Consumption** | Android `BatteryManager` hardware counters | `%` & `mAh` | Microampere-hour draw and percentage drop per benchmark session |
| **Thermal Throttling** | `PowerManager.addThermalStatusListener` | Status level | Thermal status tracking (`NONE`, `LIGHT`, `MODERATE`, `SEVERE`, `CRITICAL`) |
| **Thread Scaling** | CPU thread affinity configuration | `threads` | Multi-core scaling comparison across 2, 4, and 6 active threads |

---

## Standard Benchmark Protocol

To ensure reproducible and scientifically valid comparisons across devices, PocketBench enforces a standardized benchmark protocol:

1. **Standardized Prompt Sets**: Fixed multi-tier prompts testing short context (32 tokens), reasoning (128 tokens), and long-context summarization (512 tokens).
2. **Warm-Up Iteration**: Every benchmark session runs 1 unrecorded warm-up iteration to load OS page caches and prevent cold-cache bias.
3. **Multi-Run Averaging**: Runs $N$ measured runs (default: 5 runs) and computes the **Median**, **Minimum**, and **Maximum** for every metric.
4. **Foreground Service & Wake-Lock**: Benchmarks execute inside an Android `ForegroundService` with a partial CPU wake-lock, preventing OS CPU core capping or display timeouts.
5. **Thermal State Capture**: Ambient and device thermal throttle levels are captured at every iteration — runs affected by severe throttling are flagged rather than discarded.

---

## Curated Models & Quantizations Catalog

PocketBench includes a built-in catalog of small, edge-optimized language models packaged in GGUF format:

| Model Family | Parameter Count | Quantizations Available | Memory Footprint | Ideal Device Tier |
|---|---|---|---|---|
| **SmolLM2** | 135M / 360M / 1.7B | Q4_K_M, Q8_0, FP16 | ~90 MB – 1.1 GB | Ultra-budget (2–4 GB RAM) |
| **Qwen 2.5** | 0.5B / 1.5B / 3.0B | Q4_0, Q4_K_M, Q8_0 | ~350 MB – 2.0 GB | Entry / Mid-range (4–6 GB RAM) |
| **Llama 3.2** | 1.0B / 3.0B | Q4_K_M, Q8_0 | ~700 MB – 2.1 GB | Mid-range (6–8 GB RAM) |
| **DeepSeek R1 Distill** | 1.5B | Q4_K_M, Q8_0 | ~1.1 GB | Mid-range (6–8 GB RAM) |
| **Gemma 2** | 2.0B | Q4_0, Q4_K_M | ~1.4 GB | Mid-range (6–8 GB RAM) |
| **Phi 3.5 Mini** | 3.8B | Q4_K_M | ~2.3 GB | Upper Mid-range (8 GB RAM) |

---

## UI & Design System

PocketBench follows the **NorthStar Design System** — an intentional, high-contrast, minimalist mobile interface designed for readability during intensive performance testing:

- **Pure OLED Black (`#000000`)**: Deep black page backgrounds across all screens to minimize OLED panel power consumption during battery testing.
- **Claude Orange (`#D97757`) as Action Signal**: Orange is used strictly as a functional signal for CTAs, active selections, and key metrics — never as decorative wash or body text.
- **Stock Google Material Symbols**: Single-family outlined icons with consistent 1.8px stroke width rendered on a 24px grid. Zero emojis in the UI.
- **Flat Elevation Hierarchy**: 1px borders (`#262626`) and surface tints over artificial shadows or glassmorphism.
- **Strict 4-Point Geometry**: Spacing scale (`4, 8, 12, 16, 20, 24, 32px`) and radius scale (`4, 6, 8, 10, 12, 16px`, pill).
- **Sentence Case Typography**: Clean typography using two font weights only (400 Regular and 500 Medium) with tabular numerals for numeric metrics.

### Application Screens

1. **Home Screen**:
   - One-tap quick benchmark launcher for selected model.
   - Live hardware telemetry overview (Device SoC, Total RAM, Available Memory, Battery level).
   - Recent benchmark history cards with key performance badges.

2. **Models Screen**:
   - Model catalog with filter chips (All, Downloaded, Small <1B, Medium 1-3B).
   - Quantization selector with estimated RAM requirement and file sizes.
   - Download manager with progress bar, download speed, and SHA256 integrity verification.

3. **Benchmark Screen**:
   - Live execution HUD showing prompt evaluation and token generation progress.
   - Real-time decode speed indicator (`t/s`) and elapsed execution timer.
   - Live RSS memory gauge with dynamic OOM risk threshold alerts.

4. **History & Compare Screen**:
   - Searchable, filterable list of all previous benchmark sessions.
   - Multi-run comparison modal: side-by-side delta view comparing decode speeds, TTFT, and RAM across models or thread configurations.
   - Multi-format exporter: One-tap export to **JSON (Schema v1)**, **CSV**, or **Markdown** tables with Android native share sheet support.

5. **Settings Screen**:
   - Execution parameters: Default thread count (2, 4, 6 threads), batch size, iteration count.
   - Diagnostics: Storage management, model cache cleanup, and device hardware profile.

---

## Technical Architecture

PocketBench is structured as a hybrid React Native application utilizing the **New Architecture (Bridgeless + TurboModules)** and native Android C++/Kotlin services:

```
PocketBench/
├── android/
│   ├── app/src/main/
│   │   ├── java/com/pocketbenchapp/
│   │   │   ├── PocketBenchModule.kt          # JSI TurboModule: RAM, SoC, battery, thermal
│   │   │   ├── PocketBenchPackage.kt         # React Native native package registration
│   │   │   ├── BenchmarkForegroundService.kt # Background-safe foreground execution service
│   │   │   ├── MainActivity.kt               # Native Activity entrypoint with edge-to-edge UI
│   │   │   └── MainApplication.kt            # ReactHost & Hermes runtime initialization
│   │   └── res/
│   │       ├── drawable/                     # Adaptive launcher vector drawables
│   │       └── mipmap-*/                     # Multi-density branded app icons (mdpi-xxxhdpi)
├── src/
│   ├── components/                           # Atomic UI library (AppButton, AppCard, AppText, AppIcon...)
│   ├── navigation/                           # Custom pure black 4-tab bottom navigation
│   ├── screens/                              # Home, Models, Benchmark, History, ResultDetail, Settings
│   ├── services/                             # Benchmark engine, metrics collector, download manager, export
│   ├── store/                                # Zustand reactive stores with AsyncStorage persistence
│   ├── theme/                                # NorthStar design tokens (colors, typography, spacing, radius)
│   ├── types/                                # TypeScript schemas for benchmarks, models, diagnostics
│   └── utils/                                # Validation, formatters, and CSV/JSON/MD report builders
├── assets/                                   # Prompts database and curated models index
└── release/                                  # Standalone signed release APK binary
```

---

## Building from Source

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **Java Development Kit**: JDK 17 (Azul Zulu or OpenJDK)
- **Android SDK**: API level 34+ with Android NDK 26.1+ and CMake 3.22.1+

### Build Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rajkrish63/ai-benchmark.git
   cd ai-benchmark
   ```

2. **Install JavaScript dependencies**:
   ```bash
   npm install
   ```

3. **Run on a connected Android device (Debug)**:
   ```bash
   npx react-native run-android
   ```

4. **Build the Standalone Release APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   The generated APK will be output at:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## Testing & Verification

PocketBench includes comprehensive test suites covering benchmark calculations, format conversions, input validation, and component rendering:

```bash
# Run TypeScript type check
npm run typecheck

# Run Jest unit and integration tests
npm run test

# Run ESLint code quality checks
npm run lint
```

---

## Submitting Benchmark Results

Help build the open mobile AI performance leaderboard! You can contribute benchmark data from your device without creating an account:

1. Run a 5-iteration benchmark on your Android phone using any catalog model.
2. Go to **History** → tap your benchmark result → tap **Export** → select **JSON**.
3. [Open a New Issue](https://github.com/rajkrish63/ai-benchmark/issues/new?title=Benchmark+Result:+[Device+Name]+-+Model) on GitHub.
4. Paste the exported JSON payload. A maintainer will verify the SHA256 checksum and merge your numbers into the community leaderboard.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
All benchmarked models belong to their respective creators under their upstream open-source licenses (Llama 3.2 Community License, Apache 2.0, Gemma Terms of Use).
