export interface DeviceInfo {
  manufacturer: string;
  model: string;
  brand: string;
  chipset: string;
  ram_gb: number;
  total_ram_mb: number;
  android_version: number;
  android_sdk: number;
  abi: string;
}

export type ThermalState = 'NONE' | 'LIGHT' | 'MODERATE' | 'SEVERE' | 'CRITICAL' | 'UNAVAILABLE';

export interface DeviceTelemetry {
  peak_rss_mb: number;
  current_rss_mb: number;
  free_ram_mb: number;
  battery_level: number; // 0 - 100 percentage
  battery_mah: number; // Current charge counter or mAh
  is_charging: boolean;
  thermal_state: ThermalState;
  timestamp: number;
}

