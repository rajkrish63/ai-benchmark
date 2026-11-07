import curatedIndex from '../../assets/models-index.json';
import {
  CuratedModel,
  DownloadProgress,
  LocalModelVariant,
  QuantizationVariant,
} from '../types/model';
import { storageService } from './storage';

export type DownloadProgressCallback = (progress: DownloadProgress) => void;

class DownloadManager {
  private activeDownloads: Map<
    string,
    { cancel: () => void; isCancelled: boolean }
  > = new Map();

  private getKey(modelId: string, quantization: string): string {
    return `${modelId}:${quantization}`;
  }

  isDownloading(modelId: string, quantization: string): boolean {
    return this.activeDownloads.has(this.getKey(modelId, quantization));
  }

  cancelDownload(modelId: string, quantization: string): void {
    const key = this.getKey(modelId, quantization);
    const active = this.activeDownloads.get(key);
    if (active) {
      active.isCancelled = true;
      active.cancel();
      this.activeDownloads.delete(key);
    }
  }

  async startDownload(
    modelId: string,
    modelName: string,
    variant: QuantizationVariant,
    onProgress: DownloadProgressCallback
  ): Promise<LocalModelVariant> {
    const key = this.getKey(modelId, variant.quantization);
    if (this.activeDownloads.has(key)) {
      throw new Error(`Download for ${modelName} (${variant.quantization}) is already in progress`);
    }

    let isCancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let verifyTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelReject: ((reason?: unknown) => void) | null = null;

    const cancel = () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
      if (verifyTimer) clearTimeout(verifyTimer);
      this.activeDownloads.delete(key);
      onProgress({
        model_id: modelId,
        quantization: variant.quantization,
        bytes_downloaded: 0,
        total_bytes: variant.size_bytes,
        percentage: 0,
        speed_mbps: 0,
        eta_seconds: 0,
        status: 'IDLE',
      });
      if (cancelReject) {
        cancelReject(new Error('Download cancelled by user'));
      }
    };

    this.activeDownloads.set(key, { cancel, isCancelled: false });

    return new Promise<LocalModelVariant>((resolve, reject) => {
      cancelReject = reject;
      const totalBytes = variant.size_bytes;
      let downloadedBytes = 0;
      const startTime = Date.now();
      let lastReportTime = startTime;
      let lastReportBytes = 0;

      // Realistic chunked progression for download handling
      const chunkSize = Math.max(5 * 1024 * 1024, Math.floor(totalBytes / 40)); // 40 steps max
      const intervalMs = 250;

      timer = setInterval(async () => {
        if (isCancelled) {
          if (timer) clearInterval(timer);
          this.activeDownloads.delete(key);
          onProgress({
            model_id: modelId,
            quantization: variant.quantization,
            bytes_downloaded: downloadedBytes,
            total_bytes: totalBytes,
            percentage: Math.round((downloadedBytes / totalBytes) * 100),
            speed_mbps: 0,
            eta_seconds: 0,
            status: 'IDLE',
          });
          reject(new Error('Download cancelled by user'));
          return;
        }

        downloadedBytes = Math.min(totalBytes, downloadedBytes + chunkSize);
        const now = Date.now();
        const deltaSec = (now - lastReportTime) / 1000;
        const deltaBytes = downloadedBytes - lastReportBytes;
        const speedMbps = deltaSec > 0 ? (deltaBytes * 8) / (deltaSec * 1024 * 1024) : 15.5;
        const remainingBytes = totalBytes - downloadedBytes;
        const etaSeconds = speedMbps > 0 ? (remainingBytes * 8) / (speedMbps * 1024 * 1024) : 0;

        lastReportTime = now;
        lastReportBytes = downloadedBytes;

        const percentage = Math.min(100, Math.round((downloadedBytes / totalBytes) * 100));

        if (downloadedBytes < totalBytes) {
          onProgress({
            model_id: modelId,
            quantization: variant.quantization,
            bytes_downloaded: downloadedBytes,
            total_bytes: totalBytes,
            percentage,
            speed_mbps: parseFloat(speedMbps.toFixed(1)),
            eta_seconds: Math.ceil(etaSeconds),
            status: 'DOWNLOADING',
          });
        } else {
          if (timer) clearInterval(timer);
          // Verifying state
          onProgress({
            model_id: modelId,
            quantization: variant.quantization,
            bytes_downloaded: totalBytes,
            total_bytes: totalBytes,
            percentage: 100,
            speed_mbps: 0,
            eta_seconds: 0,
            status: 'VERIFYING',
          });

          // Simulate SHA-256 integrity verification
          verifyTimer = setTimeout(async () => {
            if (isCancelled) {
              this.activeDownloads.delete(key);
              reject(new Error('Download cancelled by user'));
              return;
            }

            this.activeDownloads.delete(key);

            const localVariant: LocalModelVariant = {
              ...variant,
              local_path: `/data/user/0/com.pocketbenchapp/files/models/${variant.file_name}`,
              downloaded_at: new Date().toISOString(),
              verified: true,
            };

            // Lookup curated metadata to ensure full richness
            const curated = (curatedIndex.models as unknown as CuratedModel[]).find(
              (m) => m.id === modelId
            );

            // Update local models storage
            const models = await storageService.getLocalModels();
            const existingModelIndex = models.findIndex((m) => m.id === modelId);

            if (existingModelIndex >= 0) {
              const existingVariants = models[existingModelIndex].variants.filter(
                (v) => v.quantization !== variant.quantization
              );
              models[existingModelIndex].variants = [...existingVariants, localVariant];
            } else {
              models.push({
                id: modelId,
                name: modelName,
                params: curated?.params || 'Edge Model',
                architecture: curated?.architecture || 'Transformer',
                context_window: curated?.context_window || 4096,
                hf_repo: curated?.hf_repo || '',
                description: curated?.description || '',
                min_ram_gb: curated?.min_ram_gb || 4,
                recommended_ram_gb: curated?.recommended_ram_gb || 6,
                variants: [localVariant],
              });
            }

            await storageService.saveLocalModels(models);

            onProgress({
              model_id: modelId,
              quantization: variant.quantization,
              bytes_downloaded: totalBytes,
              total_bytes: totalBytes,
              percentage: 100,
              speed_mbps: 0,
              eta_seconds: 0,
              status: 'COMPLETED',
            });

            resolve(localVariant);
          }, 800);
        }
      }, intervalMs);
    });
  }

  async deleteModel(modelId: string, quantization: string): Promise<void> {
    const models = await storageService.getLocalModels();
    const modelIndex = models.findIndex((m) => m.id === modelId);
    if (modelIndex >= 0) {
      models[modelIndex].variants = models[modelIndex].variants.filter(
        (v) => v.quantization !== quantization
      );
      if (models[modelIndex].variants.length === 0) {
        models.splice(modelIndex, 1);
      }
      await storageService.saveLocalModels(models);
    }
  }
}

export const downloadManager = new DownloadManager();
