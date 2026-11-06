import { create } from 'zustand';
import { apiService } from '../services/api';
import { downloadManager } from '../services/download';
import { storageService } from '../services/storage';
import { useBenchmarkStore } from './useBenchmarkStore';
import {
  CuratedModel,
  DownloadProgress,
  LocalModel,
  LocalModelVariant,
  QuantizationVariant,
} from '../types/model';

interface ModelsState {
  curatedModels: CuratedModel[];
  localModels: LocalModel[];
  downloads: Record<string, DownloadProgress>;
  selectedFilter: 'ALL' | 'DOWNLOADED' | 'NEW';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  loadModels: () => Promise<void>;
  setFilter: (filter: 'ALL' | 'DOWNLOADED' | 'NEW') => void;
  setSearchQuery: (query: string) => void;
  downloadVariant: (
    modelId: string,
    modelName: string,
    variant: QuantizationVariant
  ) => Promise<void>;
  cancelDownload: (modelId: string, quantization: string) => void;
  deleteModelVariant: (modelId: string, quantization: string) => Promise<void>;
  clearAllLocalModels: () => Promise<void>;
  isVariantDownloaded: (modelId: string, quantization: string) => boolean;
  getLocalVariant: (modelId: string, quantization: string) => LocalModelVariant | null;
}

export const useModelsStore = create<ModelsState>((set, get) => ({
  curatedModels: [],
  localModels: [],
  downloads: {},
  selectedFilter: 'ALL',
  searchQuery: '',
  isLoading: false,
  error: null,

  loadModels: async () => {
    set({ isLoading: true, error: null });
    try {
      const [curated, local] = await Promise.all([
        apiService.fetchCuratedModels(),
        storageService.getLocalModels(),
      ]);
      set({ curatedModels: curated, localModels: local, isLoading: false });
    } catch (e: unknown) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'Failed to load models',
      });
    }
  },

  setFilter: (filter) => set({ selectedFilter: filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  downloadVariant: async (modelId, modelName, variant) => {
    const downloadKey = `${modelId}:${variant.quantization}`;
    try {
      await downloadManager.startDownload(
        modelId,
        modelName,
        variant,
        (progress) => {
          set((state) => ({
            downloads: {
              ...state.downloads,
              [downloadKey]: progress,
            },
          }));
        }
      );

      // Refresh local models
      const updatedLocal = await storageService.getLocalModels();
      set((state) => {
        const nextDownloads = { ...state.downloads };
        delete nextDownloads[downloadKey];
        return {
          localModels: updatedLocal,
          downloads: nextDownloads,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      set((state) => {
        const nextDownloads = { ...state.downloads };
        if (nextDownloads[downloadKey]) {
          nextDownloads[downloadKey] = {
            ...nextDownloads[downloadKey],
            status: 'ERROR',
            error_message: msg,
          };
        }
        return { downloads: nextDownloads };
      });
    }
  },

  cancelDownload: (modelId, quantization) => {
    const downloadKey = `${modelId}:${quantization}`;
    downloadManager.cancelDownload(modelId, quantization);
    set((state) => {
      const nextDownloads = { ...state.downloads };
      delete nextDownloads[downloadKey];
      return { downloads: nextDownloads };
    });
  },

  deleteModelVariant: async (modelId, quantization) => {
    await downloadManager.deleteModel(modelId, quantization);
    const updatedLocal = await storageService.getLocalModels();
    set({ localModels: updatedLocal });

    // Reset selectedModel if it was the variant deleted
    const benchmarkStore = useBenchmarkStore.getState();
    if (benchmarkStore.selectedModel?.quantization === quantization) {
      const stillExists = updatedLocal.some(
        (m) => m.id === modelId && m.variants.some((v) => v.quantization === quantization)
      );
      if (!stillExists) {
        benchmarkStore.setSelectedModel(null);
      }
    }
  },

  clearAllLocalModels: async () => {
    await storageService.clearAllLocalModels();
    set({ localModels: [] });
    useBenchmarkStore.getState().setSelectedModel(null);
  },

  isVariantDownloaded: (modelId, quantization) => {
    const { localModels } = get();
    const model = localModels.find((m) => m.id === modelId);
    if (!model) return false;
    return model.variants.some((v) => v.quantization === quantization);
  },

  getLocalVariant: (modelId, quantization) => {
    const { localModels } = get();
    const model = localModels.find((m) => m.id === modelId);
    if (!model) return null;
    return model.variants.find((v) => v.quantization === quantization) || null;
  },
}));

