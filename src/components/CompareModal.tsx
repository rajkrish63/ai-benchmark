import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { BenchmarkResult } from '../types/benchmark';
import { formatDateTime, formatMegaBytes, formatTokensPerSec } from '../utils/format';
import { Badge } from './Badge';
import { AppButton } from './ui/AppButton';
import { AppCard } from './ui/AppCard';
import { AppDivider } from './ui/AppDivider';
import { AppIcon } from './ui/AppIcon';
import { AppIconButton } from './ui/AppIconButton';
import { AppText } from './ui/AppText';

export interface CompareModalProps {
  visible: boolean;
  baseResult: BenchmarkResult | null;
  targetResult: BenchmarkResult | null;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  visible,
  baseResult,
  targetResult,
  onClose,
}) => {
  const { theme } = useAppTheme();

  if (!baseResult || !targetResult) return null;

  const baseSummary = baseResult.summary;
  const targetSummary = targetResult.summary;

  const decodeDiff = targetSummary.decode_tok_s_median - baseSummary.decode_tok_s_median;
  const decodeDiffPct =
    baseSummary.decode_tok_s_median > 0
      ? ((decodeDiff / baseSummary.decode_tok_s_median) * 100).toFixed(1)
      : '0';

  const ttftDiff = targetSummary.ttft_ms_median - baseSummary.ttft_ms_median;
  const ramDiff = targetSummary.peak_rss_mb_median - baseSummary.peak_rss_mb_median;
  const batteryDiff =
    targetSummary.battery_per_run_pct_median - baseSummary.battery_per_run_pct_median;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={[
          styles.overlay,
          { backgroundColor: theme.colors.overlay },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surfaceCard, // #0A0A0A
              borderColor: theme.colors.border,          // 1px #262626
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.border,
                paddingHorizontal: theme.layout.screenHorizontal,
                paddingVertical: theme.spacing[16],
              },
            ]}
          >
            <View style={styles.headerTitleBlock}>
              <AppText variant="screenTitle" weight="500">
                Benchmark comparison
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.subtitle}>
                Side-by-side performance differential
              </AppText>
            </View>
            <AppIconButton
              icon={<AppIcon name="close" size={20} color={theme.colors.textPrimary} />}
              onPress={onClose}
              accessibilityLabel="Close comparison dialog"
              size={36}
            />
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Model Headers Row */}
            <View style={styles.modelsRow}>
              <AppCard style={styles.modelColumnCard}>
                <Badge label="Baseline (A)" variant="neutral" size="sm" />
                <AppText
                  variant="body"
                  weight="500"
                  numberOfLines={2}
                  style={styles.modelName}
                >
                  {baseResult.model.name}
                </AppText>
                <Badge label={baseResult.model.quantization} variant="primary" size="sm" />
                <AppText variant="caption" color="tertiary" style={styles.modelMeta}>
                  {baseResult.config.threads} thr • {formatDateTime(baseResult.timestamp_utc)}
                </AppText>
              </AppCard>

              <AppCard style={styles.modelColumnCard}>
                <Badge label="Target (B)" variant="primary" size="sm" />
                <AppText
                  variant="body"
                  weight="500"
                  numberOfLines={2}
                  style={styles.modelName}
                >
                  {targetResult.model.name}
                </AppText>
                <Badge label={targetResult.model.quantization} variant="primary" size="sm" />
                <AppText variant="caption" color="tertiary" style={styles.modelMeta}>
                  {targetResult.config.threads} thr • {formatDateTime(targetResult.timestamp_utc)}
                </AppText>
              </AppCard>
            </View>

            {/* Metric Comparison Card */}
            <AppCard style={styles.metricsCard}>
              <AppText variant="sectionTitle" weight="500" style={styles.cardTitle}>
                Performance delta (B vs A)
              </AppText>

              {/* Decode Speed */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelBlock}>
                  <AppText variant="secondary" weight="500">
                    Decode speed
                  </AppText>
                  <AppText variant="caption" color="tertiary">
                    Higher is better
                  </AppText>
                </View>
                <View style={styles.valuesBlock}>
                  <AppText variant="caption" color="tertiary">
                    {formatTokensPerSec(baseSummary.decode_tok_s_median)}
                  </AppText>
                  <AppText variant="caption" weight="500" color="primary">
                    {formatTokensPerSec(targetSummary.decode_tok_s_median)}
                  </AppText>
                  <Badge
                    label={`${decodeDiff >= 0 ? '+' : ''}${decodeDiff.toFixed(1)} t/s (${decodeDiffPct}%)`}
                    variant={decodeDiff >= 0 ? 'success' : 'danger'}
                    size="sm"
                  />
                </View>
              </View>

              <AppDivider spacing={theme.spacing[8]} />

              {/* TTFT */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelBlock}>
                  <AppText variant="secondary" weight="500">
                    Time to first token
                  </AppText>
                  <AppText variant="caption" color="tertiary">
                    Lower is better
                  </AppText>
                </View>
                <View style={styles.valuesBlock}>
                  <AppText variant="caption" color="tertiary">
                    {baseSummary.ttft_ms_median} ms
                  </AppText>
                  <AppText variant="caption" weight="500" color="primary">
                    {targetSummary.ttft_ms_median} ms
                  </AppText>
                  <Badge
                    label={`${ttftDiff <= 0 ? '' : '+'}${ttftDiff} ms`}
                    variant={ttftDiff <= 0 ? 'success' : 'danger'}
                    size="sm"
                  />
                </View>
              </View>

              <AppDivider spacing={theme.spacing[8]} />

              {/* Peak RAM */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelBlock}>
                  <AppText variant="secondary" weight="500">
                    Peak memory (RSS)
                  </AppText>
                  <AppText variant="caption" color="tertiary">
                    Lower is better
                  </AppText>
                </View>
                <View style={styles.valuesBlock}>
                  <AppText variant="caption" color="tertiary">
                    {formatMegaBytes(baseSummary.peak_rss_mb_median)}
                  </AppText>
                  <AppText variant="caption" weight="500" color="primary">
                    {formatMegaBytes(targetSummary.peak_rss_mb_median)}
                  </AppText>
                  <Badge
                    label={`${ramDiff <= 0 ? '' : '+'}${ramDiff} MB`}
                    variant={ramDiff <= 0 ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              </View>

              <AppDivider spacing={theme.spacing[8]} />

              {/* Battery Drain */}
              <View style={styles.metricRow}>
                <View style={styles.metricLabelBlock}>
                  <AppText variant="secondary" weight="500">
                    Battery drain per run
                  </AppText>
                  <AppText variant="caption" color="tertiary">
                    Lower is better
                  </AppText>
                </View>
                <View style={styles.valuesBlock}>
                  <AppText variant="caption" color="tertiary">
                    {baseSummary.battery_per_run_pct_median}%
                  </AppText>
                  <AppText variant="caption" weight="500" color="primary">
                    {targetSummary.battery_per_run_pct_median}%
                  </AppText>
                  <Badge
                    label={`${batteryDiff <= 0 ? '' : '+'}${batteryDiff.toFixed(1)}%`}
                    variant={batteryDiff <= 0 ? 'success' : 'danger'}
                    size="sm"
                  />
                </View>
              </View>
            </AppCard>

            <View style={{ marginTop: theme.spacing[16] }}>
              <AppButton
                size="md"
                variant="secondary"
                label="Close comparison"
                onPress={onClose}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '88%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitleBlock: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  modelsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modelColumnCard: {
    flex: 1,
  },
  modelName: {
    marginVertical: 6,
  },
  modelMeta: {
    marginTop: 6,
  },
  metricsCard: {
    padding: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricLabelBlock: {
    flex: 1,
  },
  valuesBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
});
