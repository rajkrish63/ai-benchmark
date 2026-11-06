import { BenchmarkResult, RunMetrics, SummaryMetrics } from '../types/benchmark';

export function calculateSummary(runs: RunMetrics[]): SummaryMetrics {
  const measured = runs.filter((r) => !r.is_warmup);
  if (measured.length === 0) {
    return {
      ttft_ms_median: 0,
      ttft_ms_min: 0,
      ttft_ms_max: 0,
      prefill_tok_s_median: 0,
      decode_tok_s_median: 0,
      peak_rss_mb_median: 0,
      battery_per_run_pct_median: 0,
      thermal_throttled: false,
    };
  }

  const getMedian = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const ttftValues = measured.map((r) => r.ttft_ms);
  const prefillValues = measured.map((r) => r.prefill_tok_s);
  const decodeValues = measured.map((r) => r.decode_tok_s);
  const rssValues = measured.map((r) => r.peak_rss_mb);
  const batteryValues = measured.map((r) => r.battery_delta_pct);

  const hasThrottling = measured.some(
    (r) => r.thermal_state === 'SEVERE' || r.thermal_state === 'CRITICAL'
  );

  return {
    ttft_ms_median: Math.round(getMedian(ttftValues)),
    ttft_ms_min: Math.min(...ttftValues),
    ttft_ms_max: Math.max(...ttftValues),
    prefill_tok_s_median: parseFloat(getMedian(prefillValues).toFixed(1)),
    decode_tok_s_median: parseFloat(getMedian(decodeValues).toFixed(1)),
    peak_rss_mb_median: Math.round(getMedian(rssValues)),
    battery_per_run_pct_median: parseFloat(getMedian(batteryValues).toFixed(2)),
    thermal_throttled: hasThrottling,
  };
}

export function validateBenchmarkResult(data: unknown): data is BenchmarkResult {
  if (!data || typeof data !== 'object') return false;
  const res = data as Partial<BenchmarkResult>;
  if (res.schema_version !== 1) return false;
  if (!res.id || typeof res.id !== 'string') return false;
  if (!res.timestamp_utc || typeof res.timestamp_utc !== 'string') return false;
  if (
    !res.device ||
    typeof res.device !== 'object' ||
    typeof res.device.model !== 'string'
  ) {
    return false;
  }
  if (
    !res.model ||
    typeof res.model !== 'object' ||
    typeof res.model.name !== 'string' ||
    typeof res.model.quantization !== 'string'
  ) {
    return false;
  }
  if (
    !res.config ||
    typeof res.config !== 'object' ||
    typeof res.config.threads !== 'number'
  ) {
    return false;
  }
  if (!Array.isArray(res.runs)) {
    return false;
  }
  if (
    !res.summary ||
    typeof res.summary !== 'object' ||
    typeof res.summary.decode_tok_s_median !== 'number'
  ) {
    return false;
  }
  return true;
}

