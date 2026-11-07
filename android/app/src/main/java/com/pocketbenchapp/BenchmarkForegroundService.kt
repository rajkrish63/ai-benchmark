package com.pocketbenchapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager

class BenchmarkForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "pocketbench_benchmark_channel"
        const val NOTIFICATION_ID = 2025
        const val ACTION_START = "com.pocketbenchapp.action.START"
        const val ACTION_UPDATE = "com.pocketbenchapp.action.UPDATE"
        const val ACTION_STOP = "com.pocketbenchapp.action.STOP"

        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_CONTENT = "extra_content"
        const val EXTRA_PROGRESS = "extra_progress"
        const val EXTRA_MAX = "extra_max"
    }

    private var wakeLock: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_NOT_STICKY

        when (action) {
            ACTION_START -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: "PocketBench Running"
                val content = intent.getStringExtra(EXTRA_CONTENT) ?: "Executing LLM benchmark..."
                val progress = intent.getIntExtra(EXTRA_PROGRESS, 0)
                val max = intent.getIntExtra(EXTRA_MAX, 100)
                val notification = buildNotification(title, content, progress, max)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
                } else {
                    startForeground(NOTIFICATION_ID, notification)
                }
            }
            ACTION_UPDATE -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: "PocketBench Running"
                val content = intent.getStringExtra(EXTRA_CONTENT) ?: "Executing LLM benchmark..."
                val progress = intent.getIntExtra(EXTRA_PROGRESS, 0)
                val max = intent.getIntExtra(EXTRA_MAX, 100)
                val notification = buildNotification(title, content, progress, max)
                val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.notify(NOTIFICATION_ID, notification)
            }
            ACTION_STOP -> {
                stopSelf()
            }
        }

        return START_NOT_STICKY
    }

    override fun onDestroy() {
        releaseWakeLock()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        notificationManager?.cancel(NOTIFICATION_ID)
        super.onDestroy()
    }

    private fun buildNotification(title: String, content: String, progress: Int, max: Int): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
        )

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        builder.setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setContentIntent(pendingIntent)
            .setOngoing(true)

        if (max > 0) {
            builder.setProgress(max, progress, false)
        }

        return builder.build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "PocketBench Benchmark Runner",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps benchmark active in background and shows live inference progress."
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun acquireWakeLock() {
        if (wakeLock == null) {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PocketBench:ServiceWakeLock")?.apply {
                setReferenceCounted(false)
            }
        }
        wakeLock?.acquire(60 * 60 * 1000L) // 1 hr max safe timeout
    }

    private fun releaseWakeLock() {
        if (wakeLock != null && wakeLock?.isHeld == true) {
            wakeLock?.release()
        }
    }
}

