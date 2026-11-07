import modelsIndexData from '../../assets/models-index.json';
import { CuratedModel } from '../types/model';

export class ApiService {
  async fetchCuratedModels(): Promise<CuratedModel[]> {
    try {
      // In production, we can optionally fetch latest index from GitHub / HF
      // Fallback seamlessly to bundled asset
      return JSON.parse(JSON.stringify(modelsIndexData.models)) as CuratedModel[];
    } catch (err) {
      console.warn('Failed to parse models index, using fallback', err);
      return [];
    }
  }
}

export const apiService = new ApiService();

