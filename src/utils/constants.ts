export const APP_VERSION = '1.0.0';
export const APP_NAME = 'PocketBench';
export const SCHEMA_VERSION = 1;

export const DEFAULT_CONFIG = {
  threads: 4,
  context_length: 2048,
  generation_length: 512,
  warmup_runs: 1,
  measured_runs: 5,
};

export const THREAD_OPTIONS = [2, 4, 6, 8];
export const CONTEXT_LENGTH_OPTIONS = [1024, 2048, 4096, 8192];
export const GENERATION_LENGTH_OPTIONS = [128, 256, 512, 1024];
export const MEASURED_RUNS_OPTIONS = [1, 3, 5, 10];

export const STORAGE_KEYS = {
  MODELS: 'pocketbench_models_v1',
  RESULTS: 'pocketbench_results_v1',
  SETTINGS: 'pocketbench_settings_v1',
};

