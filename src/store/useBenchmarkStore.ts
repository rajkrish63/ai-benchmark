import { create } from 'zustand';
import { benchmarkOrchestrator } from '../services/benchmark';
import {
  BenchmarkConfig,
  BenchmarkLiveState,
  BenchmarkResult,
} from '../types/benchmark';
import { ModelMetadata } from '../types/model';
import { DEFAULT_CONFIG } from '../utils/constants';

interface BenchmarkState {
  config: BenchmarkConfig;
  selectedModel: ModelMetadata | null;
  liveState: BenchmarkLiveState;
  activeResult: BenchmarkResult | null;

  setConfig: (config: Partial<BenchmarkConfig>) => void;
  setSelectedModel: (model: ModelMetadata | null) => void;
  startBenchmark: () => Promise<BenchmarkResult>;
  cancelBenchmark: () => void;
  resetLiveState: () => void;
  setActiveResult: (result: BenchmarkResult | null) => void;
}

const initialLiveState: BenchmarkLiveState = {
  status: 'IDLE',
  progress_pct: 0,
  current_run: 0,
  total_runs: 0,
  is_warmup: true,
  current_prompt_index: 0,
  total_prompts: 5,
  current_prompt_name: '',
  current_tokens_generated: 0,
  estimated_remaining_seconds: 0,
  completed_runs: [],
  status_message: 'Ready to benchmark',
  can_cancel: false,
};

export const useBenchmarkStore = create<BenchmarkState>((set, get) => ({
  config: {
    ...DEFAULT_CONFIG,
    prompts_hash: 'pb_v1_f7e1b8c2d9a405ef',
  },
  selectedModel: null,
  liveState: initialLiveState,
  activeResult: null,

  setConfig: (newConfig) =>
    set((state) => ({ config: { ...state.config, ...newConfig } })),

  setSelectedModel: (selectedModel) => set({ selectedModel }),

  startBenchmark: async () => {
    const { selectedModel, config, liveState } = get();
    if (!selectedModel) {
      throw new Error('Please select a model first.');
    }

    const isAlreadyRunning =
      liveState.status !== 'IDLE' &&
      liveState.status !== 'COMPLETED' &&
      liveState.status !== 'ERROR' &&
      liveState.status !== 'CANCELLED';

    if (isAlreadyRunning || benchmarkOrchestrator.getIsRunning()) {
      return (get().activeResult || ({} as BenchmarkResult));
    }

    set({ liveState: { ...initialLiveState, status: 'PREFLIGHT_CHECK' }, activeResult: null });

    try {
      const result = await benchmarkOrchestrator.runBenchmark(
        selectedModel,
        config,
        (progress) => {
          set({ liveState: progress });
        }
      );

      set({ activeResult: result });
      return result;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Benchmark failed';
      set((state) => ({
        liveState: {
          ...state.liveState,
          status: 'ERROR',
          error_message: errorMsg,
          can_cancel: false,
        },
      }));
      throw err;
    }
  },

  cancelBenchmark: () => {
    benchmarkOrchestrator.cancelBenchmark();
    set((state) => ({
      liveState: {
        ...state.liveState,
        status_message: 'Cancelling benchmark...',
        can_cancel: false,
      },
    }));
  },

  resetLiveState: () => set({ liveState: initialLiveState }),

  setActiveResult: (activeResult) => set({ activeResult }),
}));

