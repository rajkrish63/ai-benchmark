# PocketBench — Product Requirements Document

## 1. Product Overview

**PocketBench** is an open-source Android application that benchmarks on-device LLM inference performance on mid-range and budget Android phones (4–8 GB RAM). It measures speed, memory usage, battery drain, and thermal behavior using a standardized, reproducible protocol.

**Target users:**
- Developers evaluating which small LLMs run well on their target devices
- Researchers collecting real-world mobile LLM performance data
- Enthusiasts comparing models on their own phones

**Core value:** Reproducible, open benchmarks on the hardware people actually own — not flagship devices.

---

## 2. Scope (MVP)

### In Scope
- Android app (React Native + native modules)
- Download & manage GGUF models from Hugging Face
- Run standardized benchmark protocol (warm-up + N measured runs)
- Collect metrics: load time, TTFT, prefill/decode tok/s, peak RAM, battery %, thermal state
- Export results as JSON (schema v1)
- Local result history with device info

### Out of Scope (Post-MVP)
- iOS support
- Multiple inference backends (ONNX, ExecuTorch, MediaPipe)
- Quality/accuracy evaluation
- Cloud backend / auto-submission
- Model quantization/conversion inside app
- Multi-device comparison UI

---

## 3. Functional Requirements

### 3.1 Model Management
| ID | Requirement | Priority |
|----|-------------|----------|
| F-01 | Browse curated list of GGUF models (name, params, quant, size, HF repo) | MUST |
| F-02 | Download model with resume support, show progress & ETA | MUST |
| F-03 | Verify file integrity (SHA256) after download | MUST |
| F-04 | Delete downloaded models to free space | MUST |
| F-05 | Show local model list with size, last used | SHOULD |

### 3.2 Benchmark Execution
| ID | Requirement | Priority |
|----|-------------|----------|
| F-10 | Select model + quantization + thread count (2/4/6) | MUST |
| F-11 | Fixed prompt set (5 prompts, varying context lengths) | MUST |
| F-12 | Config: warm-up runs (1), measured runs (5), context len, gen len | MUST |
| F-13 | Run protocol sequentially, no user interaction needed | MUST |
| F-14 | Cancel running benchmark, preserve partial results | SHOULD |
| F-15 | Prevent screen off during run (wake lock) | MUST |

### 3.3 Metrics Collection
| ID | Requirement | Priority |
|----|-------------|----------|
| F-20 | Model load time (ms) | MUST |
| F-21 | Time to First Token (ms) | MUST |
| F-22 | Prefill throughput (tokens/sec) | MUST |
| F-23 | Decode throughput (tokens/sec) | MUST |
| F-24 | Peak RSS (MB) via `ActivityManager.getProcessMemoryInfo` | MUST |
| F-25 | Battery delta (% and mAh via `BatteryManager`) | MUST |
| F-26 | Thermal state (THERMAL_STATUS_NONE/LIGHT/MODERATE/SEVERE/CRITICAL) per run | MUST |
| F-27 | Thread count used | MUST |
| F-28 | Device metadata (model, RAM, chipset, Android version, ABI) | MUST |

### 3.4 Results & Export
| ID | Requirement | Priority |
|----|-------------|----------|
| F-30 | View run summary (median + min/max per metric) | MUST |
| F-31 | View per-run breakdown | MUST |
| F-32 | Export single run or full session as JSON (schema v1) | MUST |
| F-33 | Share export via Android share sheet | SHOULD |
| F-34 | Local history list (date, model, key metrics) | MUST |

### 3.5 App Shell
| ID | Requirement | Priority |
|----|-------------|----------|
| F-40 | Home: quick start → pick model → run | MUST |
| F-41 | Models screen: download/manage | MUST |
| F-42 | Results screen: history + detail | MUST |
| F-43 | Settings: thread count default, run count, brightness lock | SHOULD |
| F-44 | About: version, license, links | NICE |

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NF-01 | App size (APK) | < 50 MB |
| NF-02 | Cold start to home | < 3 s |
| NF-03 | Benchmark overhead (non-inference) | < 5% of runtime |
| NF-04 | Works offline after model download | Yes |
| NF-05 | Min Android SDK | 24 (Android 7.0) |
| NF-06 | Target Android SDK | 34 (Android 14) |
| NF-07 | Architectures | arm64-v8a, armeabi-v7a |
| NF-08 | Crash-free rate | > 99.5% |
| NF-09 | No PII collected | Verified |

---

## 5. Data Models

### 5.1 BenchmarkResult (JSON Export Schema v1)
```json
{
  "schema_version": 1,
  "timestamp_utc": "2025-01-15T12:34:56Z",
  "device": {
    "manufacturer": "samsung",
    "model": "SM-A546E",
    "chipset": "Exynos 1380",
    "ram_gb": 6,
    "android_version": 14,
    "abi": "arm64-v8a"
  },
  "model": {
    "name": "Phi-3-mini-4k-instruct",
    "params": "3.8B",
    "quantization": "Q4_K_M",
    "gguf_size_mb": 2350,
    "source_url": "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    "sha256": "abc123..."
  },
  "config": {
    "threads": 4,
    "context_length": 2048,
    "generation_length": 512,
    "warmup_runs": 1,
    "measured_runs": 5,
    "prompts_hash": "sha256-of-prompt-set"
  },
  "runs": [
    {
      "run_index": 0,
      "is_warmup": false,
      "load_time_ms": 1842,
      "ttft_ms": 215,
      "prefill_tok_s": 48.2,
      "decode_tok_s": 12.7,
      "peak_rss_mb": 2840,
      "battery_delta_pct": 0.3,
      "battery_delta_mah": -45,
      "thermal_state": "LIGHT",
      "prompt_index": 0,
      "tokens_generated": 512
    }
  ],
  "summary": {
    "ttft_ms_median": 218,
    "ttft_ms_min": 210,
    "ttft_ms_max": 235,
    "prefill_tok_s_median": 47.9,
    "decode_tok_s_median": 12.6,
    "peak_rss_mb_median": 2850,
    "battery_per_run_pct_median": 0.28,
    "thermal_throttled": false
  }
}
```

### 5.2 Local Storage
- **Models**: SQLite table (`models`) + files in `getExternalFilesDir()/models/`
- **Results**: SQLite table (`results`) + JSON files in `getExternalFilesDir()/results/`
- **Settings**: `SharedPreferences`

---

## 6. Prompt Set (Fixed)

| Index | Description | Approx. Tokens |
|-------|-------------|----------------|
| 0 | Short instruction (1-shot) | ~128 |
| 1 | Medium chat (3 turns) | ~512 |
| 2 | Long context (doc + Q&A) | ~1536 |
| 3 | Code generation | ~768 |
| 4 | Reasoning (multi-step) | ~1024 |

*Prompts stored in `assets/prompts.json`, hash recorded in result for reproducibility.*

---

## 7. Acceptance Criteria (MVP)

1. App installs on Android 7+ arm64 device
2. Can download at least 3 models from curated list
3. Benchmark runs to completion without crash
4. All 7 metrics recorded per run
5. JSON export validates against schema
5. Exported JSON can be imported back for viewing
6. Thermal state changes detected across repeated runs
7. Battery delta > 0 measured on 5-run session

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| llama.cpp native build fails on some ABIs | Medium | High | CI matrix testing; fallback to armeabi-v7a |
| Battery API returns coarse % (1% steps) | High | Medium | Also read charge counter (µAh) when available |
| Thermal API not available on older Android | Medium | Low | Graceful degradation; log "UNAVAILABLE" |
| Large model OOM on 4 GB devices | High | High | Pre-check available RAM; warn before run |
| Download corruption on flaky network | Medium | Medium | Resume + SHA256 verify; retry logic |
| Background kill during long benchmark | Medium | High | Foreground service with wake lock; persist progress |

---

## 9. Success Metrics (Post-Launch)

- 100+ unique devices submitting results in 3 months
- 50+ models benchmarked across community
- Median crash-free rate > 99.5%
- < 5% runs with "CRITICAL" thermal state (shows protocol works)