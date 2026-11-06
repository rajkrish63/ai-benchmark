# PocketBench — Implementation Plan

## 1. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| UI Framework | React Native 0.74+ (New Architecture) | Cross-platform ready, JSI for native perf |
| Language | TypeScript (strict) | Type safety for metrics schema |
| Native Bridge | JSI (TurboModules) + NDK | Zero-copy, low overhead for llama.cpp |
| Inference Engine | llama.cpp (ggml) via `llama.rn` or custom JSI module | Mature, fast, GGUF support, threaded |
| Build System | Gradle (Kotlin DSL) + CMake | Standard Android, NDK integration |
| Local DB | WatermelonDB (SQLite) | Reactive, performant, TypeScript entities |
| Networking | `react-native-fetch-blob` / `rn-fetch-blob` | Large file download with progress |
| State | Zustand + React Query | Simple global + server-state patterns |
| Testing | Vitest (unit), Detox (E2E) | Fast unit, real-device E2E |

---

## 2. Repository Structure

```
PocketBench/
├── android/                    # Native Android module
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── cpp/        # JSI bridge (C++)
│   │   │   │   │   ├── PocketBenchJSI.cpp
│   │   │   │   │   ├── LlamaRunner.cpp
│   │   │   │   │   ├── MetricsCollector.cpp
│   │   │   │   │   └── CMakeLists.txt
│   │   │   │   ├── java/com/pocketbench/
│   │   │   │   │   ├── PocketBenchPackage.kt
│   │   │   │   │   ├── BenchmarkService.kt      # Foreground service
│   │   │   │   │   ├── MetricsCollector.kt      # Battery/thermal/RAM
│   │   │   │   │   ├── ModelManager.kt          # Download/verify
│   │   │   │   │   └── DeviceInfo.kt
│   │   │   │   └── assets/
│   │   │   │       └── prompts.json
│   │   └── build.gradle.kts
│   ├── build.gradle.kts
│   └── settings.gradle.kts
├── src/
│   ├── components/             # Reusable UI components
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── ModelsScreen.tsx
│   │   ├── BenchmarkScreen.tsx
│   │   ├── ResultDetailScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── api.ts              # HF model index fetch
│   │   ├── download.ts         # Download manager
│   │   ├── benchmark.ts        # Orchestrates native runner
│   │   ├── export.ts           # JSON export/share
│   │   └── storage.ts          # WatermelonDB models
│   ├── store/
│   │   ├── useModelsStore.ts
│   │   ├── useBenchmarkStore.ts
│   │   └── useSettingsStore.ts
│   ├── types/
│   │   ├── benchmark.ts        # TypeScript ↔ JSON schema
│   │   ├── model.ts
│   │   └── device.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── navigation/
│       └── AppNavigator.tsx
├── assets/
│   ├── models-index.json       # Curated model list (bundled)
│   └── prompts.json
├── package.json
├── tsconfig.json
├── metro.config.js
└── README.md
```

---

## 3. Native Module Design (JSI)

### 3.1 `LlamaRunner` (C++ → JSI)
```cpp
// PocketBenchJSI.cpp — TurboModule spec
class LlamaRunner : public jsi::HostObject {
public:
  // Load model, return opaque handle
  jsi::Value loadModel(jsi::Runtime&, const jsi::Value* args, size_t count);
  // Run inference, return metrics struct
  jsi::Value runBenchmark(jsi::Runtime&, const jsi::Value* args, size_t count);
  // Cancel running inference
  jsi::Value cancel(jsi::Runtime&, const jsi::Value* args, size_t count);
  // Free model
  jsi::Value unloadModel(jsi::Runtime&, const jsi::Value* args, size_t count);
private:
  std::unique_ptr<llama_context> ctx_;
  std::atomic<bool> cancelled_{false};
};
```

**Methods exposed to JS:**
- `loadModel(path: string, nCtx: number, nThreads: number): number` → handle
- `runBenchmark(handle: number, prompt: string, nPredict: number): BenchmarkMetrics`
- `cancel(handle: number): void`
- `unloadModel(handle: number): void`

### 3.2 `MetricsCollector` (Kotlin)
```kotlin
// Runs alongside benchmark via foreground service
class MetricsCollector(private val pid: Int) {
  fun start()  // registers listeners, records baseline
  fun sample() // called per-run from JSI via JNI
  fun stop(): MetricsSnapshot // returns peak RSS, battery delta, thermal states[]
}
```
- RAM: `ActivityManager.getProcessMemoryInfo([pid])` sampled at 100 ms interval
- Battery: `BatteryManager` charge counter (µAh) + level % at start/end
- Thermal: `PowerManager.getCurrentThermalStatus()` sampled per run

### 3.3 `BenchmarkService` (Foreground Service)
- Holds wake lock (`PARTIAL_WAKE_LOCK`)
- Runs benchmark loop on background thread
- Sends progress callbacks to JS via `DeviceEventEmitter`
- Survives screen off / backgrounding

---

## 4. Key Implementation Tasks

### Phase 0: Project Setup (Week 1)
- [ ] `npx @react-native-community/cli init PocketBench --template react-native-template-typescript`
- [ ] Enable New Architecture (`newArchEnabled=true` in gradle.properties)
- [ ] Add NDK + CMake config, link `libllama.so` (prebuilt or build from source)
- [ ] Configure `llama.rn` or write custom JSI bridge
- [ ] Set up WatermelonDB schema + migrations
- [ ] CI: GitHub Actions (lint, typecheck, unit test, assembleDebug)

### Phase 1: Model Management (Week 2)
- [ ] Bundle `models-index.json` (curated list: name, params, quant, size, HF URL, SHA256)
- [ ] `ModelsScreen`: list, download with progress, resume, verify, delete
- [ ] Download service: `rn-fetch-blob` with notification progress
- [ ] Persist model metadata to WatermelonDB
- [ ] Handle storage permission (Android 10+ scoped storage)

### Phase 2: Benchmark Core (Week 3–4)
- [ ] Implement `LlamaRunner` JSI module (load, run, cancel, unload)
- [ ] Implement `MetricsCollector` Kotlin + JNI bridge
- [ ] Implement `BenchmarkService` foreground service
- [ ] Wire JS `benchmark.ts` orchestrator:
  - Load model → warm-up → N measured runs (5 prompts × N runs)
  - Collect per-run metrics from native
  - Persist result to DB
- [ ] Handle OOM gracefully (catch `std::bad_alloc`, report to UI)

### Phase 3: Results & Export (Week 5)
- [ ] `HistoryScreen`: list with date, model, key metrics
- [ ] `ResultDetailScreen`: per-run table, summary cards
- [ ] JSON export (schema v1) → file → share sheet
- [ ] Import/validate JSON (for viewing shared results)

### Phase 4: Polish & Ship (Week 6)
- [ ] Settings screen (default threads, run count, brightness)
- [ ] About screen, license, acknowledgements
- [ ] Error boundaries + crash logging (Sentry optional)
- [ ] Performance profiling (Flipper/Perfetto)
- [ ] Test on 3+ devices (4 GB, 6 GB, 8 GB RAM)
- [ ] Build release APK + bundle, sign, publish to GitHub Releases

---

## 5. Curated Model Index (Initial)

| Model | Params | Quants | Size (Q4_K_M) | HF Repo |
|-------|--------|--------|---------------|---------|
| Phi-3-mini-4k-instruct | 3.8B | Q4_K_M, Q5_K_M, Q8_0 | ~2.3 GB | microsoft/Phi-3-mini-4k-instruct-gguf |
| Gemma-2-2B-it | 2.6B | Q4_K_M, Q5_K_M, Q8_0 | ~1.6 GB | google/gemma-2-2b-it-gguf |
| Qwen2.5-1.5B-Instruct | 1.5B | Q4_K_M, Q5_K_M, Q8_0 | ~0.9 GB | Qwen/Qwen2.5-1.5B-Instruct-GGUF |
| Llama-3.2-1B-Instruct | 1.0B | Q4_K_M, Q5_K_M, Q8_0 | ~0.7 GB | meta-llama/Llama-3.2-1B-Instruct-GGUF |
| SmolLM2-1.7B-Instruct | 1.7B | Q4_K_M, Q5_K_M, Q8_0 | ~1.1 GB | HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF |

*Stored in `assets/models-index.json` with SHA256 for each file.*

---

## 6. Prompt Set (`assets/prompts.json`)

```json
{
  "version": 1,
  "hash": "sha256-to-be-computed",
  "prompts": [
    { "id": 0, "text": "### Instruction:\nSummarize this in one sentence:\n\nThe quick brown fox jumps over the lazy dog. The dog was sleeping. The fox was hungry.\n\n### Response:\n", "max_tokens": 64 },
    { "id": 1, "text": "### User:\nHi, can you help me write a Python function to calculate fibonacci numbers?\n### Assistant:\nSure! Here's a simple implementation:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n```\n\n### User:\nCan you make it more efficient?\n### Assistant:\n", "max_tokens": 256 },
    { "id": 2, "text": "### Document:\n[Long ~1500 token document about climate change]\n\n### Question:\nWhat are the three main causes of global warming mentioned in the document?\n### Answer:\n", "max_tokens": 256 },
    { "id": 3, "text": "### Instruction:\nWrite a complete, compilable C++ program that reads integers from stdin until EOF and prints their median.\n### Response:\n", "max_tokens": 512 },
    { "id": 4, "text": "### Instruction:\nThink step by step. If a train leaves Chicago at 60 mph and another leaves Detroit at 80 mph, and they're 280 miles apart, when do they meet?\n### Response:\n", "max_tokens": 256 }
  ]
}
```

---

## 7. JSON Schema Validation (TypeScript)

```typescript
// src/types/benchmark.ts
export interface BenchmarkResult {
  schema_version: 1;
  timestamp_utc: string; // ISO 8601
  device: DeviceInfo;
  model: ModelInfo;
  config: BenchmarkConfig;
  runs: RunMetrics[];
  summary: SummaryMetrics;
}

export interface RunMetrics {
  run_index: number;
  is_warmup: boolean;
  load_time_ms: number;
  ttft_ms: number;
  prefill_tok_s: number;
  decode_tok_s: number;
  peak_rss_mb: number;
  battery_delta_pct: number;
  battery_delta_mah: number;
  thermal_state: 'NONE' | 'LIGHT' | 'MODERATE' | 'SEVERE' | 'CRITICAL' | 'UNAVAILABLE';
  prompt_index: number;
  tokens_generated: number;
}
```

---

## 8. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (TS) | Vitest | 80% services/utils |
| Unit (Kotlin) | JUnit/Roboelectric | 70% collectors |
| Unit (C++) | GoogleTest | Core math/parsing |
| Integration | Detox (real device) | Happy path: download → run → export |
| Performance | Perfetto traces | Benchmark overhead < 5% |

**Device matrix for CI (Firebase Test Lab or local):**
- Pixel 6a (6 GB, Tensor)
- Galaxy A54 (6 GB, Exynos 1380)
- Xiaomi Redmi Note 12 (4 GB, Snapdragon 685)

---

## 9. Build & Release

```bash
# Debug
npx react-native run-android

# Release APK (unsigned)
cd android && ./gradlew assembleRelease

# Release AAB (for Play Store later)
cd android && ./gradlew bundleRelease

# Version bump
npm version patch|minor|major
git push --tags
# GitHub Action builds & attaches to Release
```

---

## 10. Open Questions

1. **llama.rn vs custom JSI** — `llama.rn` is maintained but adds dep; custom gives full control. Lean custom for MVP.
2. **Model storage location** — `getExternalFilesDir()/models/` (scoped, survives uninstall? No. Use `getFilesDir()` for true persistence or Documents/ for user visibility.)
3. **Prompt hash** — Compute at build time, embed in JS bundle, include in result.
4. **Background execution limits** — Android 12+ foreground service type `dataSync` or `mediaProcessing`? Use `foregroundServiceType="dataSync"` + `PARTIAL_WAKE_LOCK`.