# PocketBench

> Which small LLMs actually run well on a mid-range Android phone?
> An open, reproducible benchmark for on-device LLM inference: speed, memory, battery and heat.

<!-- TODO: add badges (license, last commit, latest release) -->

<!-- TODO: add a 60-90 second demo video or GIF here -->

## Why this exists

<!-- 3-4 sentences. State the gap: most published mobile LLM benchmarks use flagship phones.
     This project measures budget and mid-range Android devices (4-8 GB RAM),
     which is what most people actually own. -->

## What it measures

| Metric | How it is measured |
|---|---|
| Model load time | TODO |
| Time to first token (TTFT) | TODO |
| Prefill speed (tokens/sec) | TODO |
| Decode speed (tokens/sec) | TODO |
| Peak RAM | TODO (Android memory APIs, sampled during the run) |
| Battery drain | TODO (battery level / charge counter before and after) |
| Thermal state | TODO (Android thermal status across repeated runs) |
| Thread-count effect | TODO (same model at 2 / 4 / 6 threads) |

## Benchmark protocol

Results are only comparable if every run follows the same rules.

- Fixed prompt set: TODO (link to `prompts/`)
- Fixed context length and generation length: TODO
- 1 warm-up run, then the median of N runs: TODO (N = ?)
- Device unplugged, background apps closed, screen on at fixed brightness: TODO
- Thermal state recorded for every run, never discarded
- Known limitations: TODO (battery % resolution, OS scheduling noise, etc.)

## Models tested

| Model | Params | Quantization | File size |
|---|---|---|---|
| TODO | | | |

## Results

<!-- Fill this ONLY with numbers you measured yourself. Never copy numbers from other projects. -->

Link to the live leaderboard: TODO (GitHub Pages)

| Device | RAM | Chipset | Model | Quant | TTFT | Decode tok/s | Peak RAM | Battery / run | Throttled? |
|---|---|---|---|---|---|---|---|---|---|
| TODO | | | | | | | | | |

Key findings:
1. TODO
2. TODO
3. TODO

## Screenshots

| Home | Running a benchmark | Results |
|---|---|---|
| TODO | TODO | TODO |

## Install

### Download APK
Directly download the signed standalone APK from this repository:
- **[Download PocketBench v1.0.0 Release APK (`release/PocketBench-v1.0.0-release.apk`)](./release/PocketBench-v1.0.0-release.apk)** (53 MB)

### Installation Methods
1. **Direct on Phone**:
   - Download `PocketBench-v1.0.0-release.apk` to your phone.
   - Tap the downloaded file and allow installs from unknown sources if prompted.
   - Open PocketBench and launch your first benchmark.

2. **Via ADB**:
   ```bash
   adb install -r release/PocketBench-v1.0.0-release.apk
   adb shell am start -n com.pocketbenchapp/.MainActivity
   ```

## Run a benchmark

1. Pick a model and quantization.
2. Tap **Run benchmark** and leave the phone untouched until it finishes.
3. Export the result as JSON.

## Submit your device's results

<!-- Lets other people grow the leaderboard without you building a backend. -->

1. Export your result JSON in the app.
2. Open a new issue using the **Benchmark result** template.
3. Paste the JSON. A maintainer adds it to the leaderboard.

## Build from source

```bash
git clone https://github.com/rajkrish63/ai-benchmark.git
cd ai-benchmark
npm install
npx react-native run-android
```

Requirements: Node TODO, JDK TODO, Android SDK / NDK TODO.

## Architecture

```
TODO: short diagram or folder tree
App (React Native UI)
 ├── Benchmark runner (runs protocol, collects metrics)
 ├── Inference layer (llama.cpp via llama.rn / native module)
 ├── Metrics collectors (RAM, battery, thermal)
 └── Result exporter (JSON)
```

Design decisions worth explaining: TODO (why this runtime, why this measurement method).

## Roadmap

- [ ] Quality evaluation (small accuracy test per model)
- [ ] More runtimes (ONNX Runtime, ExecuTorch, MediaPipe) for comparison
- [ ] iOS support
- [ ] Automatic result submission
- [ ] TODO

## Limitations

<!-- Be honest. Interviewers respect this. -->

- Results depend on phone state, temperature and OS version.
- TODO

## Contributing

Bug reports, device results and pull requests are welcome. See `CONTRIBUTING.md`.

## Acknowledgements

- [llama.cpp](https://github.com/ggml-org/llama.cpp) for the inference engine
- TODO (llama.rn, model authors)

## License

TODO (MIT is a common choice)

## Author

**Rajesh S** · [GitHub](https://github.com/rajkrish63) · [LinkedIn](https://www.linkedin.com/in/rajesh-s-337414256)
