export function formatBytes(bytes: number, decimals = 1): string {
  if (isNaN(bytes) || bytes === 0) return '0 B';
  if (bytes < 0) return `-${formatBytes(-bytes, decimals)}`;
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatMegaBytes(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${Math.round(mb)} MB`;
}

export function formatTokensPerSec(tokS: number): string {
  if (isNaN(tokS) || tokS === 0) return '0.0 t/s';
  return `${tokS.toFixed(1)} t/s`;
}

export function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)} s`;
  }
  return `${Math.round(ms)} ms`;
}

export function formatDurationSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0s';
  if (!isFinite(seconds)) return '—';
  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`;
  }
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `${m}m ${s}s`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

