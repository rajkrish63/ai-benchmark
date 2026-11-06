import { DeviceInfo, ThermalState } from './device';
import { ModelMetadata } from './model';

export interface BenchmarkConfig {
  threads: number;
  context_length: number;
  generation_length: number;
  warmup_runs: number;
  measured_runs: number;
  prompts_hash: string;
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
  thermal_state: ThermalState;
  prompt_index: number;
  tokens_generated: number;
}

export interface SummaryMetrics {
  ttft_ms_median: number;
  ttft_ms_min: number;
  ttft_ms_max: number;
  prefill_tok_s_median: number;
  decode_tok_s_median: number;
  peak_rss_mb_median: number;
  battery_per_run_pct_median: number;
  thermal_throttled: boolean;
}

export interface BenchmarkResult {
  schema_version: 1;
  id: string;
  timestamp_utc: string; // ISO 8601
  device: DeviceInfo;
  model: ModelMetadata;
  config: BenchmarkConfig;
  runs: RunMetrics[];
  summary: SummaryMetrics;
  is_partial?: boolean;
}

export type BenchmarkExecutionStatus =
  | 'IDLE'
  | 'PREFLIGHT_CHECK'
  | 'LOADING_MODEL'
  | 'WARMUP_RUN'
  | 'MEASURED_RUNS'
  | 'COMPUTING_SUMMARY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ERROR';

export interface PromptItem {
  id: number;
  name: string;
  description: string;
  approx_tokens: number;
  max_tokens: number;
  text: string;
}

export interface PromptSetFile {
  version: number;
  hash: string;
  prompts: PromptItem[];
}

export interface BenchmarkLiveState {
  status: BenchmarkExecutionStatus;
  progress_pct: number;
  current_run: number;
  total_runs: number;
  is_warmup: boolean;
  current_prompt_index: number;
  total_prompts: number;
  current_prompt_name: string;
  current_tokens_generated: number;
  estimated_remaining_seconds: number;
  last_run_metrics?: RunMetrics;
  completed_runs: RunMetrics[];
  status_message: string;
  error_message?: string;
  can_cancel: boolean;
}

