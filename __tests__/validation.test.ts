import { calculateSummary, validateBenchmarkResult } from '../src/utils/validation';
import { RunMetrics, BenchmarkResult } from '../src/types/benchmark';

describe('Validation and Summary Calculations', () => {
  it('calculates statistical medians and ranges correctly', () => {
    const mockRuns: RunMetrics[] = [
      {
        run_index: 0,
        is_warmup: true,
        load_time_ms: 1500,
        ttft_ms: 250,
        prefill_tok_s: 40.0,
        decode_tok_s: 10.0,
        peak_rss_mb: 2000,
        battery_delta_pct: 0.1,
        battery_delta_mah: -10,
        thermal_state: 'NONE',
        prompt_index: 0,
        tokens_generated: 64,
      },
      {
        run_index: 1,
        is_warmup: false,
        load_time_ms: 1500,
        ttft_ms: 200,
        prefill_tok_s: 50.0,
        decode_tok_s: 15.0,
        peak_rss_mb: 2200,
        battery_delta_pct: 0.2,
        battery_delta_mah: -20,
        thermal_state: 'NONE',
        prompt_index: 0,
        tokens_generated: 128,
      },
      {
        run_index: 2,
        is_warmup: false,
        load_time_ms: 1500,
        ttft_ms: 220,
        prefill_tok_s: 48.0,
        decode_tok_s: 14.0,
        peak_rss_mb: 2250,
        battery_delta_pct: 0.25,
        battery_delta_mah: -25,
        thermal_state: 'LIGHT',
        prompt_index: 0,
        tokens_generated: 128,
      },
      {
        run_index: 3,
        is_warmup: false,
        load_time_ms: 1500,
        ttft_ms: 210,
        prefill_tok_s: 52.0,
        decode_tok_s: 16.0,
        peak_rss_mb: 2300,
        battery_delta_pct: 0.3,
        battery_delta_mah: -30,
        thermal_state: 'NONE',
        prompt_index: 0,
        tokens_generated: 128,
      },
    ];

    const summary = calculateSummary(mockRuns);

    // Filtered out warmup (run 0), so 3 measured runs:
    // TTFT: [200, 210, 220] -> median 210, min 200, max 220
    expect(summary.ttft_ms_median).toBe(210);
    expect(summary.ttft_ms_min).toBe(200);
    expect(summary.ttft_ms_max).toBe(220);

    // Decode: [14, 15, 16] -> median 15.0
    expect(summary.decode_tok_s_median).toBe(15.0);

    // Thermal throttling: NONE & LIGHT -> false
    expect(summary.thermal_throttled).toBe(false);
  });

  it('detects thermal throttling when SEVERE or CRITICAL thermal state occurs', () => {
    const mockRuns: RunMetrics[] = [
      {
        run_index: 1,
        is_warmup: false,
        load_time_ms: 1200,
        ttft_ms: 210,
        prefill_tok_s: 45.0,
        decode_tok_s: 12.0,
        peak_rss_mb: 2100,
        battery_delta_pct: 0.2,
        battery_delta_mah: -20,
        thermal_state: 'SEVERE',
        prompt_index: 0,
        tokens_generated: 64,
      },
    ];

    const summary = calculateSummary(mockRuns);
    expect(summary.thermal_throttled).toBe(true);
  });

  it('validates benchmark result against schema v1', () => {
    const validResult: BenchmarkResult = {
      schema_version: 1,
      id: 'test_123',
      timestamp_utc: '2025-01-15T12:00:00Z',
      device: {
        manufacturer: 'Samsung',
        model: 'SM-A546E',
        brand: 'Samsung',
        chipset: 'Exynos 1380',
        ram_gb: 6,
        total_ram_mb: 6144,
        android_version: 14,
        android_sdk: 34,
        abi: 'arm64-v8a',
      },
      model: {
        name: 'Phi-3-mini-4k-instruct',
        params: '3.8B',
        quantization: 'Q4_K_M',
        gguf_size_mb: 2282,
        source_url: 'https://huggingface.co/test',
        sha256: 'abc12345',
      },
      config: {
        threads: 4,
        context_length: 2048,
        generation_length: 512,
        warmup_runs: 1,
        measured_runs: 3,
        prompts_hash: 'hash123',
      },
      runs: [],
      summary: {
        ttft_ms_median: 210,
        ttft_ms_min: 200,
        ttft_ms_max: 220,
        prefill_tok_s_median: 48.0,
        decode_tok_s_median: 14.5,
        peak_rss_mb_median: 2500,
        battery_per_run_pct_median: 0.25,
        thermal_throttled: false,
      },
    };

    expect(validateBenchmarkResult(validResult)).toBe(true);
    expect(validateBenchmarkResult({ schema_version: 2 })).toBe(false);
    expect(validateBenchmarkResult(null)).toBe(false);
  });
});

