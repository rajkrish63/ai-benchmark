import { exportService } from '../src/services/export';
import { BenchmarkResult } from '../src/types/benchmark';

describe('Export and Import Service', () => {
  const sampleResult: BenchmarkResult = {
    schema_version: 1,
    id: 'test_pb_001',
    timestamp_utc: '2025-01-15T10:00:00Z',
    device: {
      manufacturer: 'Google',
      model: 'Pixel 6a',
      brand: 'Google',
      chipset: 'Google Tensor',
      ram_gb: 6,
      total_ram_mb: 6144,
      android_version: 14,
      android_sdk: 34,
      abi: 'arm64-v8a',
    },
    model: {
      name: 'Llama-3.2-1B-Instruct',
      params: '1.2B',
      quantization: 'Q4_K_M',
      gguf_size_mb: 770,
      source_url: 'https://huggingface.co/test',
      sha256: '4391ef1466a987d6928eac19409b30528ef3878da620c356fbe40193bb9e88aa',
    },
    config: {
      threads: 4,
      context_length: 2048,
      generation_length: 512,
      warmup_runs: 1,
      measured_runs: 3,
      prompts_hash: 'pb_v1_f7e1b8c2d9a405ef',
    },
    runs: [],
    summary: {
      ttft_ms_median: 180,
      ttft_ms_min: 170,
      ttft_ms_max: 195,
      prefill_tok_s_median: 62.4,
      decode_tok_s_median: 27.5,
      peak_rss_mb_median: 1400,
      battery_per_run_pct_median: 0.15,
      thermal_throttled: false,
    },
  };

  it('generates valid JSON string matching schema v1', () => {
    const jsonStr = exportService.generateJsonString(sampleResult);
    expect(jsonStr).toContain('"schema_version": 1');
    expect(jsonStr).toContain('"Llama-3.2-1B-Instruct"');

    const parsed = JSON.parse(jsonStr);
    expect(parsed.schema_version).toBe(1);
    expect(parsed.device.model).toBe('Pixel 6a');
  });

  it('imports valid schema v1 JSON text successfully', async () => {
    const jsonStr = JSON.stringify(sampleResult);
    const imported = await exportService.importJsonString(jsonStr);
    expect(imported.id).toBe('test_pb_001');
    expect(imported.model.name).toBe('Llama-3.2-1B-Instruct');
  });

  it('rejects invalid or corrupted JSON on import', async () => {
    await expect(exportService.importJsonString('not json')).rejects.toThrow();
    await expect(
      exportService.importJsonString(JSON.stringify({ some_other_data: 123 }))
    ).rejects.toThrow(/Invalid schema/);
  });
});

