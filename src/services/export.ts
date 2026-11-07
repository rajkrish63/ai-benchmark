import { Share } from 'react-native';
import { BenchmarkResult } from '../types/benchmark';
import { validateBenchmarkResult } from '../utils/validation';
import { storageService } from './storage';

class ExportService {
  generateJsonString(result: BenchmarkResult): string {
    return JSON.stringify(result, null, 2);
  }

  async shareResult(result: BenchmarkResult): Promise<boolean> {
    try {
      const jsonContent = this.generateJsonString(result);
      const safeModelName = (result.model?.name || 'model').replace(/[^a-zA-Z0-9._-]/g, '_');
      const safeQuant = (result.model?.quantization || 'raw').replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `pocketbench-${safeModelName}-${safeQuant}-${result.id}.json`;

      await Share.share(
        {
          title: filename,
          message: jsonContent,
        },
        {
          dialogTitle: `Export Benchmark: ${result.model.name}`,
          subject: filename,
        }
      );
      return true;
    } catch (err) {
      console.warn('Error sharing result:', err);
      return false;
    }
  }

  async importJsonString(jsonText: string): Promise<BenchmarkResult> {
    try {
      const parsed = JSON.parse(jsonText);
      if (!validateBenchmarkResult(parsed)) {
        throw new Error('Invalid schema: File is not a valid PocketBench v1 result format.');
      }
      await storageService.saveResult(parsed);
      return parsed;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON file';
      throw new Error(`Import failed: ${msg}`);
    }
  }
}

export const exportService = new ExportService();
