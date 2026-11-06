import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { LocalModel } from '../types/model';
import { BenchmarkResult } from '../types/benchmark';

export interface AppSettings {
  default_threads: number;
  default_measured_runs: number;
  default_context_length: number;
  default_generation_length: number;
  keep_screen_on: boolean;
  show_notifications: boolean;
  auto_export: boolean;
  theme_mode: 'system' | 'light' | 'dark';
}

const DEFAULT_SETTINGS: AppSettings = {
  default_threads: 4,
  default_measured_runs: 5,
  default_context_length: 2048,
  default_generation_length: 512,
  keep_screen_on: true,
  show_notifications: true,
  auto_export: false,
  theme_mode: 'system',
};

const MAX_SAVED_RESULTS = 100;

class StorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn(`Storage error reading key "${key}":`, e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error(`Storage error writing key "${key}":`, e);
      throw e;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Storage error removing key "${key}":`, e);
      throw e;
    }
  }

  // --- Models ---
  async getLocalModels(): Promise<LocalModel[]> {
    const raw = await this.getItem(STORAGE_KEYS.MODELS);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as LocalModel[];
    } catch {
      return [];
    }
  }

  async saveLocalModels(models: LocalModel[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
  }

  async clearAllLocalModels(): Promise<void> {
    await this.setItem(STORAGE_KEYS.MODELS, JSON.stringify([]));
  }

  // --- Benchmark Results ---
  async getResults(): Promise<BenchmarkResult[]> {
    const raw = await this.getItem(STORAGE_KEYS.RESULTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as BenchmarkResult[];
    } catch {
      return [];
    }
  }

  async saveResult(result: BenchmarkResult): Promise<void> {
    const existing = await this.getResults();
    const updated = [result, ...existing.filter((r) => r.id !== result.id)].slice(0, MAX_SAVED_RESULTS);
    await this.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
  }

  async deleteResult(id: string): Promise<void> {
    const existing = await this.getResults();
    const filtered = existing.filter((r) => r.id !== id);
    await this.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(filtered));
  }

  async clearAllResults(): Promise<void> {
    await this.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    const raw = await this.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const merged = { ...current, ...settings };
    await this.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  }
}

export const storageService = new StorageService();
