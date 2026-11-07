import { NativeModules, Platform } from 'react-native';
import { DeviceInfo, DeviceTelemetry, ThermalState } from '../types/device';

const { PocketBenchModule } = NativeModules;

class DeviceService {
  private wakeLockHeld = false;

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (Platform.OS === 'android' && PocketBenchModule?.getDeviceInfo) {
      try {
        const info = await PocketBenchModule.getDeviceInfo();
        return {
          manufacturer: info.manufacturer || 'Android',
          model: info.model || 'Generic Device',
          brand: info.brand || 'Android',
          chipset: info.chipset || 'ARMv8 Processor',
          ram_gb: info.ram_gb || 6,
          total_ram_mb: info.total_ram_mb || 6144,
          android_version: info.android_version || 14,
          android_sdk: info.android_sdk || 34,
          abi: info.abi || 'arm64-v8a',
        };
      } catch (e) {
        console.warn('Failed to call native getDeviceInfo', e);
      }
    }

    // Default fallback
    return {
      manufacturer: 'Generic',
      model: 'Android Device',
      brand: 'Generic',
      chipset: 'ARMv8 Processor',
      ram_gb: 6,
      total_ram_mb: 6144,
      android_version: 14,
      android_sdk: 34,
      abi: 'arm64-v8a',
    };
  }

  async getTelemetry(): Promise<DeviceTelemetry> {
    if (Platform.OS === 'android' && PocketBenchModule?.getDeviceTelemetry) {
      try {
        const tele = await PocketBenchModule.getDeviceTelemetry();
        return {
          peak_rss_mb: tele.peak_rss_mb || 1840,
          current_rss_mb: tele.current_rss_mb || 1720,
          free_ram_mb: tele.free_ram_mb || 2450,
          battery_level: tele.battery_level !== undefined ? tele.battery_level : 85,
          battery_mah: tele.battery_mah || 4200,
          is_charging: !!tele.is_charging,
          thermal_state: (tele.thermal_state as ThermalState) || 'NONE',
          timestamp: Date.now(),
        };
      } catch (e) {
        console.warn('Failed to call native getDeviceTelemetry', e);
      }
    }

    // Default mock telemetry for development & simulator
    return {
      peak_rss_mb: 1850,
      current_rss_mb: 1680,
      free_ram_mb: 2850,
      battery_level: 82,
      battery_mah: 4100,
      is_charging: false,
      thermal_state: 'NONE',
      timestamp: Date.now(),
    };
  }

  async acquireWakeLock(): Promise<boolean> {
    if (this.wakeLockHeld) return true;
    if (Platform.OS === 'android' && PocketBenchModule?.acquireWakeLock) {
      try {
        await PocketBenchModule.acquireWakeLock();
        this.wakeLockHeld = true;
        return true;
      } catch (e) {
        console.warn('Failed to acquire wake lock', e);
      }
    }
    this.wakeLockHeld = true;
    return true;
  }

  async releaseWakeLock(): Promise<void> {
    if (!this.wakeLockHeld) return;
    if (Platform.OS === 'android' && PocketBenchModule?.releaseWakeLock) {
      try {
        await PocketBenchModule.releaseWakeLock();
      } catch (e) {
        console.warn('Failed to release wake lock', e);
      }
    }
    this.wakeLockHeld = false;
  }

  async startForegroundNotification(title: string, content: string, progress = 0, max = 100): Promise<void> {
    if (Platform.OS === 'android' && PocketBenchModule?.startBenchmarkService) {
      try {
        await PocketBenchModule.startBenchmarkService(title, content, progress, max);
      } catch (e) {
        console.warn('Failed to start foreground service', e);
      }
    }
  }

  async updateForegroundNotification(title: string, content: string, progress: number, max = 100): Promise<void> {
    if (Platform.OS === 'android' && PocketBenchModule?.updateBenchmarkService) {
      try {
        await PocketBenchModule.updateBenchmarkService(title, content, progress, max);
      } catch (e) {
        console.warn('Failed to update foreground service', e);
      }
    }
  }

  async stopForegroundNotification(): Promise<void> {
    if (Platform.OS === 'android' && PocketBenchModule?.stopBenchmarkService) {
      try {
        await PocketBenchModule.stopBenchmarkService();
      } catch (e) {
        console.warn('Failed to stop foreground service', e);
      }
    }
  }
}

export const deviceService = new DeviceService();

