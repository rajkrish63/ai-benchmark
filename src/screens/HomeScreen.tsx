import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge } from '../components/Badge';
import { Header } from '../components/Header';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { SegmentedControl } from '../components/SegmentedControl';
import { TabKey } from '../components/TabBar';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppDivider } from '../components/ui/AppDivider';
import { AppIcon } from '../components/ui/AppIcon';
import { AppText } from '../components/ui/AppText';
import { useAppTheme } from '../hooks/useAppTheme';
import { deviceService } from '../services/device';
import { useBenchmarkStore } from '../store/useBenchmarkStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useModelsStore } from '../store/useModelsStore';
import { BenchmarkResult } from '../types/benchmark';
import { DeviceInfo } from '../types/device';
import { LocalModel, LocalModelVariant } from '../types/model';
import { formatDateTime, formatTokensPerSec } from '../utils/format';

interface HomeScreenProps {
  onNavigateTab: (tab: TabKey) => void;
  onOpenBenchmark: () => void;
  onSelectResult: (result: BenchmarkResult) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenBenchmark,
  onSelectResult,
}) => {
  const { theme } = useAppTheme();
  const { localModels, loadModels } = useModelsStore();
  const { config, setConfig, selectedModel, setSelectedModel } = useBenchmarkStore();
  const { results, loadResults } = useHistoryStore();
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null);

  useEffect(() => {
    loadModels();
    loadResults();
    deviceService.getDeviceInfo().then(setDeviceInfo);
  }, [loadModels, loadResults]);

  // Flatten all downloaded variants
  const downloadedVariants = useMemo(() => {
    const list: {
      modelId: string;
      modelName: string;
      params: string;
      variant: LocalModelVariant;
    }[] = [];

    localModels.forEach((m: LocalModel) => {
      m.variants.forEach((v: LocalModelVariant) => {
        list.push({
          modelId: m.id,
          modelName: m.name,
          params: m.params,
          variant: v,
        });
      });
    });

    return list;
  }, [localModels]);

  // Auto-select first downloaded model if none selected or if selectedModel is stale/missing
  useEffect(() => {
    if (downloadedVariants.length > 0) {
      const isSelectedModelValid =
        selectedModel &&
        downloadedVariants.some(
          (v) =>
            v.modelName === selectedModel.name &&
            v.variant.quantization === selectedModel.quantization
        );

      if (!isSelectedModelValid) {
        const first = downloadedVariants[0];
        setSelectedModel({
          name: first.modelName,
          params: first.params || 'Edge Model',
          quantization: first.variant.quantization,
          gguf_size_mb: first.variant.size_mb,
          source_url: first.variant.download_url,
          sha256: first.variant.sha256,
          local_path: first.variant.local_path,
        });
      }
    } else if (selectedModel) {
      setSelectedModel(null);
    }
  }, [downloadedVariants, selectedModel, setSelectedModel]);

  const handleStartBenchmark = () => {
    if (!selectedModel) {
      Alert.alert(
        'No model downloaded',
        'Please download at least one GGUF model from the models tab to begin benchmarking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to models', onPress: () => onNavigateTab('Models') },
        ]
      );
      return;
    }
    useBenchmarkStore.getState().resetLiveState();
    onOpenBenchmark();
  };

  const recentResults = results.slice(0, 3);

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      <Header
        title="PocketBench"
        subtitle="Standardized on-device LLM benchmark suite"
        showLogo
        rightActionLabel="About"
        onRightAction={() => {
          Alert.alert(
            'PocketBench v1.0.0',
            'PocketBench is an on-device Android benchmarking suite designed to measure speed (TTFT, prefill, decode tokens/s), peak RAM, battery drain, and thermal throttling on mobile devices.\n\nJSON schema: v1\nLicense: Apache 2.0 / MIT'
          );
        }}
      />

      {/* Device info card */}
      {deviceInfo ? (
        <View style={styles.deviceWrapper}>
          <AppCard secondary style={styles.deviceCard}>
            <View style={styles.deviceIconWrapper}>
              <AppIcon name="memory" size={20} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.deviceDetails}>
              <AppText variant="body" weight="500">
                {deviceInfo.manufacturer} {deviceInfo.model}
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.deviceSub}>
                {deviceInfo.chipset} • {deviceInfo.ram_gb} GB RAM • Android {deviceInfo.android_version}
              </AppText>
            </View>
          </AppCard>
        </View>
      ) : null}

      {/* Benchmark setup section */}
      <Section
        title="Run benchmark"
        subtitle="Select a downloaded model and configure inference parameters"
      >
        <AppCard>
          <AppText variant="microLabel" color="tertiary" style={styles.sectionLabel}>
            Model selection
          </AppText>

          {downloadedVariants.length === 0 ? (
            <TouchableOpacity
              style={[
                styles.emptyModelBox,
                {
                  backgroundColor: theme.colors.surfaceRaised,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.75}
              onPress={() => onNavigateTab('Models')}
            >
              <View style={styles.emptyModelHeader}>
                <AppIcon name="warning" size={18} color={theme.colors.warning} />
                <AppText variant="secondary" weight="500" color="primary" style={styles.emptyModelTitle}>
                  No models downloaded yet
                </AppText>
              </View>
              <AppText
                variant="caption"
                color="secondary"
                style={styles.emptyModelSub}
              >
                Tap here to browse and download curated GGUF models.
              </AppText>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.modelScrollView}
              contentContainerStyle={styles.modelScrollContent}
            >
              {downloadedVariants.map((item) => {
                const isSelected =
                  selectedModel?.name === item.modelName &&
                  selectedModel?.quantization === item.variant.quantization;

                return (
                  <TouchableOpacity
                    key={`${item.modelId}-${item.variant.quantization}`}
                    style={[
                      styles.modelOption,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primaryTint
                          : theme.colors.surfaceRaised,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                        borderRadius: theme.radius.card, // 12px
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => {
                      setSelectedModel({
                        name: item.modelName,
                        params: item.params || 'Edge Model',
                        quantization: item.variant.quantization,
                        gguf_size_mb: item.variant.size_mb,
                        source_url: item.variant.download_url,
                        sha256: item.variant.sha256,
                        local_path: item.variant.local_path,
                      });
                    }}
                  >
                    <View style={styles.modelOptionHeader}>
                      <AppText
                        variant="secondary"
                        weight="500"
                        color={isSelected ? 'accent' : 'primary'}
                        numberOfLines={1}
                        style={styles.modelOptionName}
                      >
                        {item.modelName}
                      </AppText>
                      {isSelected ? (
                        <AppIcon name="check" size={16} color={theme.colors.primary} />
                      ) : null}
                    </View>

                    <View style={styles.modelOptionMeta}>
                      <Badge
                        label={item.variant.quantization}
                        variant={isSelected ? 'primary' : 'neutral'}
                        size="sm"
                      />
                      <AppText variant="caption" color="tertiary" style={styles.modelOptionSize}>
                        {item.variant.size_mb} MB
                      </AppText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <AppDivider spacing={theme.spacing[12]} />

          {/* Steppers */}
          <SegmentedControl
            label="Threads"
            options={[2, 4, 6]}
            selectedValue={config.threads}
            onSelect={(t) => setConfig({ threads: t })}
            formatOption={(t) => `${t} threads`}
          />

          <AppDivider spacing={theme.spacing[12]} />

          <SegmentedControl
            label="Measured runs"
            options={[3, 5, 10]}
            selectedValue={config.measured_runs}
            onSelect={(r) => setConfig({ measured_runs: r })}
            formatOption={(r) => `${r} runs`}
          />

          <View style={styles.ctaWrapper}>
            <AppButton
              label="Start benchmark"
              icon={<AppIcon name="bolt" size={18} color="#000000" />}
              size="lg"
              variant="primary"
              disabled={downloadedVariants.length === 0}
              onPress={handleStartBenchmark}
            />
          </View>
        </AppCard>
      </Section>

      {/* Recent results section */}
      <Section
        title="Recent results"
        subtitle={
          results.length > 0
            ? `${results.length} total benchmark runs recorded`
            : undefined
        }
        rightActionLabel={results.length > 0 ? `View all (${results.length})` : undefined}
        onRightAction={() => onNavigateTab('History')}
      >
        {recentResults.length === 0 ? (
          <AppCard secondary style={styles.emptyRecentCard}>
            <AppText variant="body" weight="500" align="center">
              No benchmarks completed yet
            </AppText>
            <AppText
              variant="secondary"
              color="tertiary"
              align="center"
              style={styles.emptyRecentSub}
            >
              Run your first benchmark above to record speed, RAM, and thermal metrics.
            </AppText>
          </AppCard>
        ) : (
          recentResults.map((item: BenchmarkResult) => {
            const isThrottled = Boolean(item.summary.thermal_throttled);

            return (
              <AppCard
                key={item.id}
                onPress={() => onSelectResult(item)}
                style={styles.resultItemCard}
              >
                <View style={styles.resultRowTop}>
                  <View style={styles.resultNameBlock}>
                    <AppText variant="body" weight="500">
                      {item.model.name}
                    </AppText>
                    <View style={styles.badgeRow}>
                      <Badge
                        label={item.model.quantization}
                        variant="neutral"
                        size="sm"
                      />
                      <AppText variant="caption" color="tertiary">
                        {formatDateTime(item.timestamp_utc)}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.resultScoreBlock}>
                    <AppText
                      variant="metricValue"
                      weight="500"
                      color="accent"
                      align="right"
                    >
                      {formatTokensPerSec(item.summary.decode_tok_s_median)}
                    </AppText>
                    <AppText variant="caption" color="tertiary" align="right">
                      Decode speed
                    </AppText>
                  </View>
                </View>

                <AppDivider spacing={theme.spacing[8]} />

                <View style={styles.resultRowBottom}>
                  <AppText variant="caption" color="secondary">
                    TTFT: {item.summary.ttft_ms_median} ms • RAM: {item.summary.peak_rss_mb_median} MB
                  </AppText>
                  <Badge
                    label={isThrottled ? 'Throttled' : 'Optimal'}
                    variant={isThrottled ? 'danger' : 'success'}
                    showDot
                    size="sm"
                  />
                </View>
              </AppCard>
            );
          })
        )}
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  deviceWrapper: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  deviceIconWrapper: {
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceSub: {
    marginTop: 2,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  emptyModelBox: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  emptyModelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyModelTitle: {
    marginLeft: 8,
  },
  emptyModelSub: {
    marginTop: 2,
  },
  modelScrollView: {
    marginBottom: 12,
  },
  modelScrollContent: {
    paddingVertical: 4,
  },
  modelOption: {
    width: 170,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
  },
  modelOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modelOptionName: {
    flex: 1,
    marginRight: 4,
  },
  modelOptionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modelOptionSize: {
    marginLeft: 6,
  },
  ctaWrapper: {
    marginTop: 20,
  },
  emptyRecentCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyRecentSub: {
    marginTop: 4,
  },
  resultItemCard: {
    marginBottom: 12,
  },
  resultRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultNameBlock: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  resultScoreBlock: {
    alignItems: 'flex-end',
  },
  resultRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
