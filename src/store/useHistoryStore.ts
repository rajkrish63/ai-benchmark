import { create } from 'zustand';
import { exportService } from '../services/export';
import { storageService } from '../services/storage';
import { BenchmarkResult } from '../types/benchmark';

interface HistoryState {
  results: BenchmarkResult[];
  isLoading: boolean;
  searchQuery: string;
  selectedModelFilter: string;

  loadResults: () => Promise<void>;
  deleteResult: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setModelFilter: (filter: string) => void;
  importResultJson: (json: string) => Promise<BenchmarkResult>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  results: [],
  isLoading: false,
  searchQuery: '',
  selectedModelFilter: 'ALL',

  loadResults: async () => {
    set({ isLoading: true });
    try {
      const results = await storageService.getResults();
      set({ results, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  deleteResult: async (id: string) => {
    await storageService.deleteResult(id);
    const updated = await storageService.getResults();
    set({ results: updated });
  },

  clearAll: async () => {
    await storageService.clearAllResults();
    set({ results: [] });
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setModelFilter: (selectedModelFilter) => set({ selectedModelFilter }),

  importResultJson: async (json: string) => {
    const imported = await exportService.importJsonString(json);
    const updated = await storageService.getResults();
    set({ results: updated });
    return imported;
  },
}));
