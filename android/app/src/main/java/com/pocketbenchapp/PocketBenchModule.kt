package com.pocketbenchapp

import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import android.os.Process
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PocketBenchModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var wakeLock: PowerManager.WakeLock? = null

    override fun getName(): String = "PocketBenchModule"

    @ReactMethod
    fun getDeviceInfo(promise: Promise) {
        try {
            val actManager = reactContext.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
            val memInfo = ActivityManager.MemoryInfo()
            actManager?.getMemoryInfo(memInfo)

            val totalRamMb = (memInfo.totalMem / (1024 * 1024)).toInt()
            val totalRamGb = Math.round(totalRamMb.toDouble() / 1024.0).toInt()

            val chipset = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                try {
                    Build.SOC_MODEL.ifEmpty { Build.HARDWARE }
                } catch (e: Exception) {
                    Build.HARDWARE
                }
            } else {
                Build.HARDWARE
            }

            val map = Arguments.createMap().apply {
                putString("manufacturer", Build.MANUFACTURER)
                putString("model", Build.MODEL)
                putString("brand", Build.BRAND)
                putString("chipset", chipset)
                putInt("ram_gb", if (totalRamGb > 0) totalRamGb else 6)
                putInt("total_ram_mb", totalRamMb)
                putInt("android_version", Build.VERSION.RELEASE.toIntOrNull() ?: 14)
                putInt("android_sdk", Build.VERSION.SDK_INT)
                putString("abi", if (Build.SUPPORTED_ABIS.isNotEmpty()) Build.SUPPORTED_ABIS[0] else "arm64-v8a")
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("DEVICE_INFO_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getDeviceTelemetry(promise: Promise) {
        try {
            val actManager = reactContext.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
            val memInfo = ActivityManager.MemoryInfo()
            actManager?.getMemoryInfo(memInfo)
            val freeRamMb = (memInfo.availMem / (1024 * 1024)).toInt()

            val pids = intArrayOf(Process.myPid())
            val pssInfo = actManager?.getProcessMemoryInfo(pids)
            val currentRssMb = if (pssInfo != null && pssInfo.isNotEmpty()) {
                pssInfo[0].totalPss / 1024
            } else {
                1500
            }

            val batteryManager = reactContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
            val batteryLevel = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: 80
            val chargeCounterUah = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CHARGE_COUNTER) ?: -1
            val batteryMah = if (chargeCounterUah > 0) chargeCounterUah / 1000 else 4000

            val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
            val batteryStatus = reactContext.registerReceiver(null, ifilter)
            val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

            var thermalState = "NONE"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
                val statusInt = powerManager?.currentThermalStatus ?: 0
                thermalState = when (statusInt) {
                    PowerManager.THERMAL_STATUS_NONE -> "NONE"
                    PowerManager.THERMAL_STATUS_LIGHT -> "LIGHT"
                    PowerManager.THERMAL_STATUS_MODERATE -> "MODERATE"
                    PowerManager.THERMAL_STATUS_SEVERE -> "SEVERE"
                    PowerManager.THERMAL_STATUS_CRITICAL -> "CRITICAL"
                    PowerManager.THERMAL_STATUS_EMERGENCY -> "CRITICAL"
                    PowerManager.THERMAL_STATUS_SHUTDOWN -> "CRITICAL"
                    else -> "NONE"
                }
            }

            val map = Arguments.createMap().apply {
                putInt("current_rss_mb", currentRssMb)
                putInt("peak_rss_mb", currentRssMb)
                putInt("free_ram_mb", freeRamMb)
                putInt("battery_level", batteryLevel)
                putInt("battery_mah", batteryMah)
                putBoolean("is_charging", isCharging)
                putString("thermal_state", thermalState)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("TELEMETRY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun acquireWakeLock(promise: Promise) {
        try {
            if (wakeLock == null) {
                val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
                wakeLock = powerManager?.newWakeLock(
                    PowerManager.PARTIAL_WAKE_LOCK,
                    "PocketBench:BenchmarkWakeLock"
                )?.apply {
                    setReferenceCounted(false)
                }
            }
            wakeLock?.acquire(30 * 60 * 1000L) // 30 minutes max safety timeout
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WAKELOCK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun releaseWakeLock(promise: Promise) {
        try {
            if (wakeLock != null && wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WAKELOCK_RELEASE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startBenchmarkService(title: String, content: String, progress: Int, max: Int, promise: Promise) {
        try {
            val intent = Intent(reactContext, BenchmarkForegroundService::class.java).apply {
                action = BenchmarkForegroundService.ACTION_START
                putExtra(BenchmarkForegroundService.EXTRA_TITLE, title)
                putExtra(BenchmarkForegroundService.EXTRA_CONTENT, content)
                putExtra(BenchmarkForegroundService.EXTRA_PROGRESS, progress)
                putExtra(BenchmarkForegroundService.EXTRA_MAX, max)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_SERVICE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun updateBenchmarkService(title: String, content: String, progress: Int, max: Int, promise: Promise) {
        try {
            val intent = Intent(reactContext, BenchmarkForegroundService::class.java).apply {
                action = BenchmarkForegroundService.ACTION_UPDATE
                putExtra(BenchmarkForegroundService.EXTRA_TITLE, title)
                putExtra(BenchmarkForegroundService.EXTRA_CONTENT, content)
                putExtra(BenchmarkForegroundService.EXTRA_PROGRESS, progress)
                putExtra(BenchmarkForegroundService.EXTRA_MAX, max)
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("UPDATE_SERVICE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopBenchmarkService(promise: Promise) {
        try {
            val intent = Intent(reactContext, BenchmarkForegroundService::class.java).apply {
                action = BenchmarkForegroundService.ACTION_STOP
            }
            reactContext.stopService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_SERVICE_ERROR", e.message, e)
        }
    }
}

