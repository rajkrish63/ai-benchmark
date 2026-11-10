import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
} from 'react-native';
import { Badge } from '../components/Badge';
import { Header } from '../components/Header';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { ProgressBar } from '../components/ProgressBar';
import { SegmentedControl } from '../components/SegmentedControl';
import { StatCard } from '../components/StatCard';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppDivider } from '../components/ui/AppDivider';
import { AppIcon } from '../components/ui/AppIcon';
import { AppText } from '../components/ui/AppText';
import { useAppTheme } from '../hooks/useAppTheme';
import { deviceService } from '../services/device';
import { useBenchmarkStore } from '../store/useBenchmarkStore';
import { BenchmarkResult, RunMetrics } from '../types/benchmark';
import { DeviceInfo, DeviceTelemetry } from '../types/device';
import {
  CONTEXT_LENGTH_OPTIONS,
  GENERATION_LENGTH_OPTIONS,
  MEASURED_RUNS_OPTIONS,
  THREAD_OPTIONS,
} from '../utils/constants';
import {
  formatDurationSeconds,
  formatMegaBytes,
  formatTokensPerSec,
} from '../utils/format';

interface BenchmarkScreenProps {
  onClose: () => void;
  onBenchmarkComplete: (result: BenchmarkResult) => void;
}

export const BenchmarkScreen: React.FC<BenchmarkScreenProps> = ({
  onClose,
  onBenchmarkComplete,
}) => {
  const { theme } = useAppTheme();
  const {
    selectedModel,
    config,
    setConfig,
    liveState,
    startBenchmark,
    cancelBenchmark,
    resetLiveState,
  } = useBenchmarkStore();

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);

  useEffect(() => {
    deviceService.getDeviceInfo().then(setDeviceInfo);
    deviceService.getTelemetry().then(setTelemetry);
  }, []);

  const isRunning =
    liveState.status !== 'IDLE' &&
    liveState.status !== 'COMPLETED' &&
    liveState.status !== 'CANCELLED' &&
    liveState.status !== 'ERROR';

  const handleStart = async () => {
    if (isRunning) return;
    if (!selectedModel) {
      Alert.alert('No model', 'Please select a model to benchmark.');
      return;
    }

    try {
      const res = await startBenchmark();
      if (res && res.id) {
        onBenchmarkComplete(res);
      }
    } catch {
      // Error handled in store
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel benchmark?',
      'Any completed runs will be preserved and saved in partial results.',
      [
        { text: 'Keep running', style: 'cancel' },
        {
          text: 'Cancel run',
          style: 'destructive',
          onPress: () => {
            cancelBenchmark();
          },
        },
      ]
    );
  };

  if (!selectedModel) {
    return (
      <Screen>
        <Header title="Benchmark" rightActionLabel="Close" onRightAction={onClose} />
        <View style={styles.emptyCenter}>
          <AppCard secondary style={styles.emptyCard}>
            <AppText variant="sectionTitle" weight="500" align="center">
              No model selected
            </AppText>
            <AppText
              variant="secondary"
              color="tertiary"
              align="center"
              style={styles.emptyCardSub}
            >
              Please select a downloaded model to run a benchmark.
            </AppText>
            <AppButton
              size="md"
              variant="primary"
              label="Back to models"
              onPress={onClose}
            />
          </AppCard>
        </View>
      </Screen>
    );
  }

  // Pre-flight checks
  const modelSizeMb = selectedModel.gguf_size_mb;
  const availableRamMb = telemetry?.free_ram_mb || 3000;
  const hasRamWarning = availableRamMb < modelSizeMb + 800;
  const hasBatteryWarning = (telemetry?.battery_level || 100) < 20;

  // Render Live Running View
  if (isRunning || liveState.status === 'COMPLETED' || liveState.status === 'CANCELLED') {
    const lastMetrics = liveState.last_run_metrics;
    const thermalState = (lastMetrics?.thermal_state || telemetry?.thermal_state || 'NONE');
    const isThrottled = thermalState === 'SEVERE' || thermalState === 'CRITICAL';

    return (
      <Screen scrollable contentContainerStyle={styles.content}>
        <Header
          title={isRunning ? 'Running benchmark' : 'Run finished'}
          subtitle={`${selectedModel.name} (${selectedModel.quantization})`}
          rightActionLabel={isRunning ? 'Cancel' : 'Close'}
          onRightAction={isRunning ? handleCancel : onClose}
        />

        {/* Progress Card */}
        <Section title="Progress and current task">
          <AppCard highlight>
            <View style={styles.runIndicatorRow}>
              <AppText variant="secondary" weight="500" color="accent">
                {liveState.is_warmup
                  ? 'Warm-up run'
                  : `Run ${liveState.current_run} of ${config.measured_runs}`}
              </AppText>
              <AppText variant="caption" color="tertiary">
                Prompt {liveState.current_prompt_index + 1} of {liveState.total_prompts}
              </AppText>
            </View>

            <ProgressBar
              progress={liveState.progress_pct}
              showLabel
              height={8}
              subtext={
                isRunning
                  ? `ETA: ${formatDurationSeconds(liveState.estimated_remaining_seconds)}`
                  : liveState.status_message
              }
            />

            <View
              style={[
                styles.currentPromptBox,
                {
                  backgroundColor: theme.colors.surfaceRaised,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                  marginTop: theme.spacing[12],
                },
              ]}
            >
              <AppText variant="microLabel" color="tertiary">
                Current task
              </AppText>
              <AppText variant="secondary" weight="500" numberOfLines={1} style={styles.promptName}>
                {liveState.current_prompt_name || 'Initializing runner...'}
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.promptStatus}>
                {liveState.status_message}
              </AppText>
            </View>
          </AppCard>
        </Section>

        {/* Live Telemetry Metrics */}
        <Section title="Live telemetry">
          <View style={styles.metricsGrid}>
            <View style={styles.metricRow}>
              <StatCard
                label="Decode speed"
                value={lastMetrics ? lastMetrics.decode_tok_s.toFixed(1) : '—'}
                unit="tok/s"
                highlightColor={theme.colors.primary}
                subtext="Tokens per second"
              />
              <StatCard
                label="Time to first token"
                value={lastMetrics ? lastMetrics.ttft_ms : '—'}
                unit="ms"
                highlightColor={theme.colors.primary}
                subtext="TTFT latency"
              />
            </View>

            <View style={styles.metricRow}>
              <StatCard
                label="Prefill speed"
                value={lastMetrics ? lastMetrics.prefill_tok_s.toFixed(1) : '—'}
                unit="tok/s"
                highlightColor={theme.colors.primary}
                subtext="Prompt throughput"
              />
              <StatCard
                label="Peak RAM (RSS)"
                value={lastMetrics ? lastMetrics.peak_rss_mb : '—'}
                unit="MB"
                highlightColor={theme.colors.warning}
                subtext={`Model: ${modelSizeMb} MB`}
              />
            </View>

            <View style={styles.metricRow}>
              <StatCard
                label="Battery drain"
                value={lastMetrics ? `${lastMetrics.battery_delta_pct}%` : '—'}
                unit=""
                highlightColor={theme.colors.danger}
                subtext="Per run drain"
              />
              <AppCard style={styles.thermalStatusCard}>
                <AppText variant="microLabel" color="tertiary">
                  Thermal state
                </AppText>
                <View style={styles.thermalBadgeWrap}>
                  <Badge
                    label={thermalState}
                    variant={isThrottled ? 'danger' : 'success'}
                    showDot
                    size="md"
                  />
                </View>
                <AppText variant="caption" color="secondary">
                  {isThrottled ? 'Throttling possible' : 'Optimal temperature'}
                </AppText>
              </AppCard>
            </View>
          </View>
        </Section>

        {/* Completed Runs Count */}
        {liveState.completed_runs.length > 0 ? (
          <Section title={`Completed iterations (${liveState.completed_runs.length})`}>
            <AppCard>
              {liveState.completed_runs.map((r: RunMetrics, i: number) => (
                <View key={i}>
                  {i > 0 ? <AppDivider spacing={theme.spacing[8]} /> : null}
                  <View style={styles.completedRunRow}>
                    <AppText variant="caption" weight="500">
                      {r.is_warmup ? 'Warmup' : `Run #${r.run_index}`}
                    </AppText>
                    <AppText variant="caption" weight="500" color="accent">
                      {formatTokensPerSec(r.decode_tok_s)}
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      {r.ttft_ms} ms TTFT
                    </AppText>
                    <AppText variant="caption" color="tertiary">
                      {r.peak_rss_mb} MB
                    </AppText>
                  </View>
                </View>
              ))}
            </AppCard>
          </Section>
        ) : null}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {isRunning ? (
            <AppButton
              variant="destructive"
              size="lg"
              label="Cancel benchmark"
              icon={<AppIcon name="close" size={18} color={theme.colors.danger} />}
              onPress={handleCancel}
            />
          ) : (
            <AppButton
              variant="primary"
              size="lg"
              label="View benchmark summary"
              onPress={() => {
                if (useBenchmarkStore.getState().activeResult) {
                  onBenchmarkComplete(useBenchmarkStore.getState().activeResult!);
                } else {
                  resetLiveState();
                  onClose();
                }
              }}
            />
          )}
        </View>
      </Screen>
    );
  }

  // Configuration Mode
  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      <Header
        title="Configure benchmark"
        subtitle="Standardized evaluation protocol"
        rightActionLabel="Close"
        onRightAction={onClose}
      />

      {/* Target Model Card */}
      <Section title="Target model">
        <AppCard highlight>
          <View style={styles.modelHeaderTop}>
            <AppText variant="sectionTitle" weight="500">
              {selectedModel.name}
            </AppText>
            <Badge label={selectedModel.quantization} variant="primary" />
          </View>
          <AppText variant="secondary" color="secondary" style={styles.modelMeta}>
            Parameters: {selectedModel.params} • File size: {formatMegaBytes(selectedModel.gguf_size_mb)}
          </AppText>
        </AppCard>
      </Section>

      {/* Pre-flight Diagnostics */}
      <Section title="System diagnostics" subtitle="Hardware resource availability">
        <AppCard>
          <View style={styles.diagRow}>
            <AppText variant="secondary" color="secondary">
              Device RAM:
            </AppText>
            <AppText variant="secondary" weight="500">
              {deviceInfo?.ram_gb} GB ({formatMegaBytes(availableRamMb)} free)
            </AppText>
          </View>

          <AppDivider />

          <View style={styles.diagRow}>
            <AppText variant="secondary" color="secondary">
              Battery level:
            </AppText>
            <AppText variant="secondary" weight="500">
              {telemetry?.battery_level}% {telemetry?.is_charging ? '(Charging)' : ''}
            </AppText>
          </View>

          <AppDivider />

          <View style={styles.diagRow}>
            <AppText variant="secondary" color="secondary">
              Thermal state:
            </AppText>
            <Badge
              label={telemetry?.thermal_state || 'NONE'}
              variant="neutral"
              size="sm"
            />
          </View>

          {/* Warning banner: 1px warning border, rgba(234,179,8,0.10) fill, warning icon, white text */}
          {hasRamWarning ? (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: theme.colors.warningTint,
                  borderColor: theme.colors.warning,
                  borderRadius: theme.radius.sm,
                  marginTop: theme.spacing[12],
                },
              ]}
            >
              <View style={styles.warningHeaderRow}>
                <AppIcon name="warning" size={16} color={theme.colors.warning} />
                <AppText variant="caption" color="primary" style={styles.warningText}>
                  Available RAM ({formatMegaBytes(availableRamMb)}) is close to model size (
                  {formatMegaBytes(modelSizeMb)}). High risk of memory pressure.
                </AppText>
              </View>
            </View>
          ) : null}

          {hasBatteryWarning ? (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor: theme.colors.warningTint,
                  borderColor: theme.colors.warning,
                  borderRadius: theme.radius.sm,
                  marginTop: theme.spacing[12],
                },
              ]}
            >
              <View style={styles.warningHeaderRow}>
                <AppIcon name="warning" size={16} color={theme.colors.warning} />
                <AppText variant="caption" color="primary" style={styles.warningText}>
                  Battery level is below 20%. Connect a charger to ensure benchmark completes reliably.
                </AppText>
              </View>
            </View>
          ) : null}
        </AppCard>
      </Section>

      {/* Protocol Configuration */}
      <Section title="Benchmark parameters" subtitle="Adjust execution limits and runs">
        <AppCard>
          <SegmentedControl
            label="CPU thread count"
            options={THREAD_OPTIONS}
            selectedValue={config.threads}
            onSelect={(t) => setConfig({ threads: t })}
            formatOption={(t) => `${t} threads`}
          />

          <AppDivider spacing={theme.spacing[12]} />

          <SegmentedControl
            label="Context window length"
            options={CONTEXT_LENGTH_OPTIONS}
            selectedValue={config.context_length}
            onSelect={(c) => setConfig({ context_length: c })}
            formatOption={(c) => `${c} tokens`}
          />

          <AppDivider spacing={theme.spacing[12]} />

          <SegmentedControl
            label="Max generation length"
            options={GENERATION_LENGTH_OPTIONS}
            selectedValue={config.generation_length}
            onSelect={(g) => setConfig({ generation_length: g })}
            formatOption={(g) => `${g} tokens`}
          />

          <AppDivider spacing={theme.spacing[12]} />

          <SegmentedControl
            label="Measured evaluation runs"
            options={MEASURED_RUNS_OPTIONS}
            selectedValue={config.measured_runs}
            onSelect={(r) => setConfig({ measured_runs: r })}
            formatOption={(r) => `${r} runs`}
          />
        </AppCard>
      </Section>

      {/* Start Button */}
      <View style={styles.startActionWrap}>
        <AppButton
          variant="primary"
          size="lg"
          label={isRunning ? 'Running benchmark...' : 'Start benchmark'}
          icon={<AppIcon name="bolt" size={18} color="#000000" />}
          disabled={isRunning}
          loading={isRunning}
          onPress={handleStart}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyCardSub: {
    marginTop: 6,
    marginBottom: 20,
  },
  runIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPromptBox: {
    padding: 10,
    borderWidth: 1,
  },
  promptName: {
    marginTop: 2,
  },
  promptStatus: {
    marginTop: 2,
  },
  metricsGrid: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thermalStatusCard: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  thermalBadgeWrap: {
    marginTop: 6,
    marginBottom: 4,
  },
  completedRunRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  bottomActions: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  modelHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelMeta: {
    marginTop: 4,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  warningBox: {
    padding: 10,
    borderWidth: 1,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  startActionWrap: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
