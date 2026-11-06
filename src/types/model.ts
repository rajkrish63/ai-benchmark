export type QuantizationType = 'Q4_K_M' | 'Q5_K_M' | 'Q8_0' | 'Q4_0' | 'Q4_1' | 'Q8_K' | string;

export interface QuantizationVariant {
  quantization: QuantizationType;
  size_bytes: number;
  size_mb: number;
  file_name: string;
  download_url: string;
  sha256: string;
}

export interface CuratedModel {
  id: string;
  name: string;
  params: string;
  architecture: string;
  context_window: number;
  hf_repo: string;
  description: string;
  min_ram_gb: number;
  recommended_ram_gb: number;
  variants: QuantizationVariant[];
}

export interface DownloadProgress {
  model_id: string;
  quantization: QuantizationType;
  bytes_downloaded: number;
  total_bytes: number;
  percentage: number;
  speed_mbps: number;
  eta_seconds: number;
  status: 'IDLE' | 'DOWNLOADING' | 'VERIFYING' | 'COMPLETED' | 'ERROR' | 'PAUSED';
  error_message?: string;
}

export interface LocalModelVariant extends QuantizationVariant {
  local_path: string;
  downloaded_at: string;
  verified: boolean;
  last_used_at?: string;
}

export interface LocalModel extends Omit<CuratedModel, 'variants'> {
  variants: LocalModelVariant[];
}

export interface ModelMetadata {
  name: string;
  params: string;
  quantization: QuantizationType;
  gguf_size_mb: number;
  source_url: string;
  sha256: string;
  local_path?: string;
}

