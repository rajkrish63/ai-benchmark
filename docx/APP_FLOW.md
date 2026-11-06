# PocketBench — App Flow & User Journeys

## 1. Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                      Bottom Tab Bar                         │
│  [Home]    [Models]    [History]    [Settings]              │
└─────────────────────────────────────────────────────────────┘
         │           │            │            │
         ▼           ▼            ▼            ▼
    ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Home    │ │ Models   │ │ History  │ │ Settings │
    │ Screen  │ │ Screen   │ │ Screen   │ │ Screen   │
    └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
         │           │            │            │
         │    ┌──────┴──────┐     │            │
         │    ▼             ▼     │            │
         │ Model Detail    Download│            │
         │ (bottom sheet) Progress │            │
         │                  ▼     │            │
         │             ┌────────┐  │            │
         └────────────►│Benchmark│  │            │
                       │ Screen  │  │            │
                       └────┬────┘  │            │
                            │       │            │
                     ┌──────┴──────┐  │            │
                     ▼             ▼  │            │
                ┌──────────┐ ┌──────────┐          │
                │ Running  │ │ Result   │          │
                │ (modal)  │ │ Detail   │          │
                └──────────┘ └────┬─────┘          │
                                  │                │
                                  ▼                │
                            ┌──────────┐           │
                            │ Export   │           │
                            │ (share)  │           │
                            └──────────┘           │
```

---

## 2. Screen Specifications

### 2.1 Home Screen (`HomeScreen.tsx`)
**Purpose:** Quick-start entry point.

```
┌────────────────────────────────────────┐
│ PocketBench                    [i]     │  ← Header: app name + About link
├────────────────────────────────────────┤
│  Run a Benchmark                       │
│  ┌──────────────────────────────────┐  │
│  │ Select Model ▼                   │  │  ← Dropdown: downloaded models only
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Threads: [4] ▼   Runs: [5] ▼     │  ← Inline steppers (persist to settings)
│  └──────────────────────────────────┘  │
│                                        │
│  [  RUN BENCHMARK  ]  (primary CTA)    │  ← Disabled if no model selected
│                                        │
│  Recent Results                        │
│  ┌──────────────────────────────────┐  │
│  │ Phi-3-mini Q4_K_M  12.6 tok/s  → │  ← Tap → ResultDetailScreen
│  │ Gemma-2-2B Q4_K_M  18.2 tok/s  → │
│  └──────────────────────────────────┘  │
│                                        │
│  [View All Results]                    │  ← → HistoryScreen
└────────────────────────────────────────┘
```

**States:**
- Empty: "No models downloaded. Go to Models tab."
- Running: CTA shows "Running..." + progress, disabled

---

### 2.2 Models Screen (`ModelsScreen.tsx`)
**Purpose:** Discover, download, manage models.

```
┌────────────────────────────────────────┐
│ Models                          [⚙]    │  ← Settings shortcut
├────────────────────────────────────────┤
│  [Search models...]                    │
│  [Filter: ▼ All / Downloaded / New]    │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │  ← ModelCard (repeated)
│  │ Phi-3-mini-4k-instruct    [3.8B] │  │
│  │ Q4_K_M  2.3 GB    [DOWNLOAD]     │  │  ← If not downloaded
│  │ Q5_K_M  2.9 GB    [DOWNLOAD]     │  │
│  │ Q8_0    4.1 GB    [DOWNLOAD]     │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Gemma-2-2B-it            [2.6B] │  │
│  │ Q4_K_M  1.6 GB    [DELETE]  ✓   │  │  ← Downloaded: show DELETE + check
│  │ Q5_K_M  2.0 GB    [DOWNLOAD]     │  │
│  └──────────────────────────────────┘  │
│  ...                                    │
└────────────────────────────────────────┘
```

**ModelCard interactions:**
- Tap quantization row → expand: size, SHA256, HF link
- **Download** → starts background download, shows progress in row + notification
- **Delete** → confirmation dialog → removes file + DB record

**Download Progress (in-row + notification):**
```
Q4_K_M  2.3 GB  ████████░░  68%  12.4 MB/s  2m 15s
[✕ Cancel]
```

---

### 2.3 Benchmark Screen (`BenchmarkScreen.tsx`)
**Purpose:** Configure & execute benchmark run.

**Entry points:**
- From Home: "RUN BENCHMARK" (pre-fills model)
- From ModelCard: "Run benchmark" (pre-fills model + quant)

```
┌────────────────────────────────────────┐
│ Benchmark: Phi-3-mini Q4_K_M      [✕]  │  ← Modal or full screen
├────────────────────────────────────────┤
│  Configuration                         │
│  ┌──────────────────────────────────┐  │
│  │ Threads:  [2] [4] [6]            │  │  ← Segmented control
│  │ Context:  [2048] [4096] [8192]   │  │
│  │ Gen len:  [256] [512] [1024]     │  │
│  │ Measured runs: [3] [5] [10]      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ⚠ Device: 6 GB RAM  •  Model: 2.3 GB  │  ← RAM warning if close
│  ⚠ Battery: 78%  •  Plugged: No        │  ← Warn if < 20% or charging
│                                        │
│  [  START BENCHMARK  ]                 │
└────────────────────────────────────────┘
```

**Validation before start:**
- Model file exists + SHA256 matches
- Available RAM > model size + 1 GB headroom
- Battery > 20% (or charging)
- No other benchmark running

---

### 2.4 Running Benchmark (Modal/Fullscreen)
**Purpose:** Live feedback during execution.

```
┌────────────────────────────────────────┐
│ Running Benchmark...              [✕]  │  ← Cancel button (confirm)
├────────────────────────────────────────┤
│  Model: Phi-3-mini Q4_K_M              │
│  Threads: 4  |  Runs: 1 warm + 5 meas  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ ████████████████░░░░░░░░░░  40%  │  │  ← Overall progress
│  │ Run 3 of 6  •  Prompt 2 of 5     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Live Metrics (last completed run)     │
│  ┌──────────────┬────────────────────┐  │
│  │ TTFT         │ 218 ms             │  │
│  │ Prefill      │ 48.2 tok/s         │  │
│  │ Decode       │ 12.6 tok/s         │  │
│  │ Peak RAM     │ 2.84 GB            │  │
│  │ Battery Δ    │ -0.28%             │  │
│  │ Thermal      │ 🟡 LIGHT           │  │  ← Color coded
│  └──────────────┴────────────────────┘  │
│                                        │
│  [CANCEL]                              │  ← Confirm dialog
└────────────────────────────────────────┘
```

**Progress granularity:**
- 0%: Loading model
- 10%: Warm-up run
- 20–90%: Measured runs (each run = 80% / N / 5 prompts)
- 100%: Computing summary, persisting

**Cancel behavior:**
- Sets `cancelled=true` in native
- Preserves completed runs
- Shows partial result screen with "Incomplete" badge

---

### 2.5 Result Detail Screen (`ResultDetailScreen.tsx`)
**Purpose:** Deep dive into a completed benchmark.

```
┌────────────────────────────────────────┐
│ Result: Phi-3-mini Q4_K_M         [⤴]  │  ← Share/Export button
├────────────────────────────────────────┤
│  Summary (median of 5 runs)            │
│  ┌──────────────┬─────────┬──────────┐  │
│  │ Metric       │ Median  │ Min/Max  │  │
│  ├──────────────┼─────────┼──────────┤  │
│  │ TTFT         │ 218 ms  │ 210/235  │  │
│  │ Prefill      │ 47.9 t/s│ 46.1/49  │  │
│  │ Decode       │ 12.6 t/s│ 12.1/13  │  │
│  │ Peak RAM     │ 2.85 GB │ 2.82/2.9 │  │
│  │ Battery/run  │ 0.28%   │ 0.25/0.3 │  │
│  │ Throttled    │ No      │          │  │
│  └──────────────┴─────────┴──────────┘  │
│                                        │
│  Device Info                           │
│  Samsung SM-A546E • Exynos 1380 • 6 GB │
│  Android 14 • arm64-v8a                │
│                                        │
│  Config                                │
│  Threads: 4 • Ctx: 2048 • Gen: 512     │
│  Prompts: v1 (hash: abc123...)         │
│                                        │
│  Per-Run Breakdown                     │
│  ┌────┬───────┬──────┬───────┬───────┬────────┬────────┬────────┐  │
│  │ #  │ Prompt│ Load │ TTFT  │ Pref. │ Decode │ RAM    │ Therm  │  │
│  ├────┼───────┼──────┼───────┼───────┼────────┼────────┼────────┤  │
│  │ W  │ 0     │ 1842 │ 225   │ 46.2  │ 12.1   │ 2.81GB │ NONE   │  │
│  │ 1  │ 0     │ —    │ 218   │ 48.2  │ 12.6   │ 2.84GB │ LIGHT  │  │
│  │ 1  │ 1     │ —    │ 235   │ 47.1  │ 12.4   │ 2.85GB │ LIGHT  │  │
│  │ ...                                   │
│  └────┴───────┴──────┴───────┴───────┴────────┴────────┴────────┘  │
│                                        │
│  [EXPORT JSON]  [DELETE]               │
└────────────────────────────────────────┘
```

**Export flow:**
1. Tap EXPORT → generates `pocketbench-<model>-<timestamp>.json`
2. Share sheet opens (Save to Files, Send via email, GitHub, etc.)
3. Toast: "Exported to Downloads/"

---

### 2.6 History Screen (`HistoryScreen.tsx`)
**Purpose:** Browse all past benchmark sessions.

```
┌────────────────────────────────────────┐
│ History                          [🗑]  │  ← Bulk delete mode
├────────────────────────────────────────┤
│  [Search...]  [Filter: ▼ All Models]   │
├────────────────────────────────────────┤
│  2025-01-15  14:32                     │
│  ┌──────────────────────────────────┐  │
│  │ Phi-3-mini Q4_K_M     12.6 t/s   │  │  ← Tap → ResultDetail
│  │ 5 runs • 4 threads • 0.28%/run   │  │
│  │ 🟢 Not throttled                 │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Gemma-2-2B Q4_K_M     18.2 t/s   │  │
│  │ 5 runs • 4 threads • 0.31%/run   │  │
│  │ 🟡 Throttled (run 4-5)           │  │
│  └──────────────────────────────────┘  │
│                                        │
│  2025-01-10  09:15                     │
│  ┌──────────────────────────────────┐  │
│  │ Qwen2.5-1.5B Q4_K_M    24.5 t/s  │  │
│  │ 3 runs • 2 threads • 0.19%/run   │  │
│  │ 🟢 Not throttled                 │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Swipe actions (per row):**
- Left: Export / Delete
- Long press: Multi-select → bulk delete / bulk export

---

### 2.7 Settings Screen (`SettingsScreen.tsx`)
**Purpose:** App preferences.

```
┌────────────────────────────────────────┐
│ Settings                               │
├────────────────────────────────────────┤
│  Benchmark Defaults                    │
│  ┌──────────────────────────────────┐  │
│  │ Default threads: [4] ▼           │  │
│  │ Default measured runs: [5] ▼     │  │
│  │ Default context length: [2048] ▼ │  │
│  │ Default generation length: [512] ▼│
│  └──────────────────────────────────┘  │
│                                        │
│  Behavior                              │
│  ┌──────────────────────────────────┐  │
│  │ [✓] Keep screen on during run    │  │
│  │ [✓] Show notification progress   │  │
│  │ [✓] Auto-export after run        │  │
│  │ [  ] Enable crash reporting      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Storage                               │
│  ┌──────────────────────────────────┐  │
│  │ Models: 2.3 GB / 12.4 GB free    │  │
│  │ Results: 1.2 MB                  │  │
│  │ [CLEAR ALL RESULTS]              │  │
│  └──────────────────────────────────┘  │
│                                        │
│  About                                 │
│  Version: 1.0.0 (build 12)             │
│  [License] [GitHub] [Privacy]          │
└────────────────────────────────────────┘
```

---

## 3. Key User Flows

### Flow 1: First-Time User (Cold Start)
```
Launch App
    │
    ▼
Home Screen (empty state)
    │
    ├── Tap "Models" tab
    │       │
    │       ▼
    │   Models Screen → See curated list
    │       │
    │       ├── Tap "Download" on Phi-3-mini Q4_K_M
    │       │       │
    │       │       ▼
    │       │   Download progress (notification + in-row)
    │       │       │
    │       │       ▼
    │       │   Verify SHA256 → Success toast
    │       │       │
    │       │       ▼
    │       │   Model shows ✓ DOWNLOADED
    │       │
    │       ▼
    │   Tap Home tab
    │       │
    │       ▼
    │   Home Screen → Model pre-selected in dropdown
    │       │
    │       ▼
    │   Tap "RUN BENCHMARK"
    │       │
    │       ▼
    │   Benchmark Screen → Confirm defaults → START
    │       │
    │       ▼
    │   Running Screen (2–5 min)
    │       │
    │       ▼
    │   Result Detail Screen
    │       │
    │       ├── Tap EXPORT → Share sheet
    │       │
    │       ▼
    │   Tap History tab → See result in list
```

**Time to first result:** ~5 min (download 2.3 GB on 20 Mbps = ~15 min, but can background)

---

### Flow 2: Repeat Benchmark (Different Config)
```
Home Screen
    │
    ├── Select different model from dropdown
    │
    ├── Tap "RUN BENCHMARK"
    │
    ├── Benchmark Screen → Change threads to 6, runs to 10
    │
    ├── START
    │
    └── Running → Result → Export
```

---

### Flow 3: Compare Results
```
History Screen
    │
    ├── Tap Result A → ResultDetail (note decode tok/s)
    │
    ├── Back → Tap Result B → ResultDetail
    │
    └── Mental compare / Export both → External analysis
```

---

### Flow 4: Submit to Leaderboard (Manual)
```
ResultDetail Screen
    │
    ├── Tap EXPORT → Save to Files/Google Drive
    │
    ├── Open browser → GitHub Issues → New Issue
    │
    ├── Select "Benchmark Result" template
    │
    ├── Paste JSON → Submit
    │
    └── Maintainer adds to leaderboard
```

---

## 4. State Transitions

### Benchmark Execution State Machine
```
IDLE
  │
  ├─ START → LOADING_MODEL
  │              │
  │              ├─ SUCCESS → WARMUP_RUN
  │              │              │
  │              │              ├─ COMPLETE → MEASURED_RUNS (run 1/5)
  │              │              │              │
  │              │              │              ├─ PROMPT_LOOP (5 prompts)
  │              │              │              │       │
  │              │              │              │       ├─ EACH PROMPT: INFERENCE → METRICS
  │              │              │              │       │
  │              │              │              │       └─ ALL PROMPTS → NEXT RUN
  │              │              │              │
  │              │              │              └─ ALL RUNS → COMPUTING_SUMMARY
  │              │              │                           │
  │              │              │                           └─ SUCCESS → COMPLETE
  │              │              │
  │              │              └─ CANCEL/ERROR → PARTIAL_COMPLETE
  │              │
  │              └─ ERROR (OOM, missing file) → ERROR
  │
  ├─ CANCEL (from any running state) → CANCELLING → PARTIAL_COMPLETE
  │
  └─ ERROR → ERROR
```

### Download State Machine
```
NOT_DOWNLOADED
  │
  ├─ START → DOWNLOADING (progress 0–100%)
  │              │
  │              ├─ PROGRESS → DOWNLOADING
  │              │
  │              ├─ COMPLETE → VERIFYING
  │              │              │
  │              │              ├─ SUCCESS → DOWNLOADED
  │              │              │
  │              │              └─ FAIL (hash mismatch) → ERROR
  │              │
  │              ├─ PAUSE → PAUSED
  │              │              │
  │              │              └─ RESUME → DOWNLOADING
  │              │
  │              ├─ CANCEL → NOT_DOWNLOADED (cleanup partial file)
  │              │
  │              └─ NETWORK_ERROR → ERROR (retry available)
  │
  └─ DELETE (from DOWNLOADED) → NOT_DOWNLOADED
```

---

## 5. Error Handling & Edge Cases

| Scenario | Detection | User Feedback | Recovery |
|----------|-----------|---------------|----------|
| Model file missing | Pre-run check | "Model file not found. Re-download?" | Deep link to Models screen |
| SHA256 mismatch | Post-download | "File corrupted. Delete and retry?" | Auto-delete, reset state |
| OOM during load | Native catch | "Not enough RAM. Try smaller model/quant." | Suggest smaller config |
| OOM during inference | Native catch | "Run out of memory on run 3. Partial results saved." | Show partial result |
| Battery < 10% | Pre-run check | "Battery low. Charge or enable battery saver?" | Block start until >20% |
| Thermal CRITICAL | Per-run sample | "Device overheating. Benchmark paused." | Auto-pause, resume when cooled |
| Background kill | Foreground service death | "Benchmark was interrupted. Partial results saved." | Restore from PARTIAL_COMPLETE |
| Storage full | Download write | "Not enough space. Free up X GB." | Open storage settings |
| Permission denied | File access | "Storage permission needed." | Request permission runtime |

---

## 6. Accessibility

- **TalkBack**: All interactive elements labeled; progress announced
- **Dynamic Type**: Respects system font scale (max 1.3x for dense tables)
- **Color Blind**: Thermal states use icons + text, not color alone
- **Touch Targets**: Minimum 48×48 dp
- **Contrast**: WCAG AA on all text

---

## 7. Offline Behavior

| Feature | Offline Support |
|---------|-----------------|
| Model list | Cached from last sync (bundled fallback) |
| Download | Requires network |
| Benchmark | Fully offline |
| Results view | Fully offline |
| Export/Share | Offline (file), Share sheet needs target app |
| Settings | Fully offline |

---

## 8. Analytics (Optional, Opt-In)

If enabled (default OFF), fire events:
- `benchmark_started` {model, quant, threads, runs}
- `benchmark_completed` {duration_s, median_decode_tok_s, throttled}
- `benchmark_failed` {stage, error_code}
- `model_downloaded` {model, quant, size_mb, duration_s}
- `result_exported` {format: 'json'}

No PII. Stored locally, batch-sent if user enables "Help improve PocketBench".

---

## 9. Permissions

| Permission | Reason | When Requested |
|------------|--------|----------------|
| `INTERNET` | Model download | Install (manifest) |
| `FOREGROUND_SERVICE` | Benchmark survival | Install (manifest) |
| `FOREGROUND_SERVICE_DATA_SYNC` | Benchmark type | Install (manifest) |
| `WAKE_LOCK` | Prevent sleep during run | Install (manifest) |
| `READ_EXTERNAL_STORAGE` | Model file access (Android ≤12) | Runtime on first download |
| `WRITE_EXTERNAL_STORAGE` | Export JSON (Android ≤12) | Runtime on first export |
| `POST_NOTIFICATIONS` | Download/benchmark progress | Runtime on Android 13+ |
| `BATTERY_STATS` | Battery delta (optional, richer data) | Runtime on first benchmark |

---

## 10. Release Checklist (Per Version)

- [ ] Version bump in `package.json` + `android/app/build.gradle.kts`
- [ ] Changelog updated (`CHANGELOG.md`)
- [ ] `models-index.json` hash verified
- [ ] `prompts.json` hash computed + embedded
- [ ] Test on 3+ physical devices (4/6/8 GB)
- [ ] Release APK + AAB built, signed
- [ ] GitHub Release drafted with APK + checksums
- [ ] README badges updated