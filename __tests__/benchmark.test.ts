import { benchmarkOrchestrator } from '../src/services/benchmark';
import { BenchmarkConfig, BenchmarkLiveState } from '../src/types/benchmark';
import { ModelMetadata } from '../src/types/model';

describe('Benchmark Orchestrator', () => {
  const mockModel: ModelMetadata = {
    name: 'SmolLM2-1.7B-Instruct',
    params: '1.7B',
    quantization: 'Q4_K_M',
    gguf_size_mb: 1030,
    source_url: 'https://huggingface.co/test',
    sha256: '63e9f4c330c6a836d5ba5d1655097483f9ee4ea7c36a233b87612f0a82e99f57',
  };

  const mockConfig: BenchmarkConfig = {
    threads: 4,
    context_length: 1024,
    generation_length: 128,
    warmup_runs: 1,
    measured_runs: 1,
    prompts_hash: 'pb_v1_f7e1b8c2d9a405ef',
  };

  it('runs standardized benchmark protocol and returns schema v1 result', async () => {
    const progressUpdates: BenchmarkLiveState[] = [];

    const result = await benchmarkOrchestrator.runBenchmark(
      mockModel,
      mockConfig,
      (state) => {
        progressUpdates.push(state);
      }
    );

    expect(result).toBeDefined();
    expect(result.schema_version).toBe(1);
    expect(result.model.name).toBe('SmolLM2-1.7B-Instruct');
    expect(result.model.quantization).toBe('Q4_K_M');
    expect(result.config.threads).toBe(4);

    // Warm-up run (1 prompt) + 1 measured run (5 prompts) = 6 total runs
    expect(result.runs.length).toBe(6);
    expect(result.runs[0].is_warmup).toBe(true);
    expect(result.runs[1].is_warmup).toBe(false);

    // Summary statistics
    expect(result.summary.decode_tok_s_median).toBeGreaterThan(0);
    expect(result.summary.ttft_ms_median).toBeGreaterThan(0);
    expect(result.summary.peak_rss_mb_median).toBeGreaterThan(0);

    // Live state updates emitted
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1].status).toBe('COMPLETED');
  }, 15000);

  it('handles cancellation and preserves partial results', async () => {
    const progressUpdates: BenchmarkLiveState[] = [];

    const benchmarkPromise = benchmarkOrchestrator.runBenchmark(
      mockModel,
      {
        ...mockConfig,
        measured_runs: 3,
      },
      (state) => {
        progressUpdates.push(state);
      }
    );

    // Cancel during measured runs so at least warmup and partial run results are captured
    setTimeout(() => {
      benchmarkOrchestrator.cancelBenchmark();
    }, 3200);

    const result = await benchmarkPromise;
    expect(result).toBeDefined();
    expect(result.is_partial).toBe(true);
    expect(result.runs.length).toBeGreaterThanOrEqual(1);
  }, 10000);
});
