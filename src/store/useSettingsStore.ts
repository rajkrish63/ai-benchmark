import { create } from 'zustand';
import { AppSettings, storageService } from '../services/storage';
import { useBenchmarkStore } from './useBenchmarkStore';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    default_threads: 4,
    default_measured_runs: 5,
    default_context_length: 2048,
    default_generation_length: 512,
    keep_screen_on: true,
    show_notifications: true,
    auto_export: false,
    theme_mode: 'system',
  },
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await storageService.getSettings();
      set({ settings, isLoading: false });
      // Sync default benchmark config
      useBenchmarkStore.getState().setConfig({
        threads: settings.default_threads,
        measured_runs: settings.default_measured_runs,
        context_length: settings.default_context_length,
        generation_length: settings.default_generation_length,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const updated = await storageService.saveSettings(newSettings);
      set({ settings: updated });
      useBenchmarkStore.getState().setConfig({
        threads: updated.default_threads,
        measured_runs: updated.default_measured_runs,
        context_length: updated.default_context_length,
        generation_length: updated.default_generation_length,
      });
    } catch (err) {
      console.warn('Failed to persist settings update:', err);
    }
  },
}));
