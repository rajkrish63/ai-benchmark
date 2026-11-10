import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge } from '../components/Badge';
import { CompareModal } from '../components/CompareModal';
import { Header } from '../components/Header';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppDivider } from '../components/ui/AppDivider';
import { AppIcon } from '../components/ui/AppIcon';
import { AppIconButton } from '../components/ui/AppIconButton';
import { AppText } from '../components/ui/AppText';
import { useAppTheme } from '../hooks/useAppTheme';
import { exportService } from '../services/export';
import { useHistoryStore } from '../store/useHistoryStore';
import { BenchmarkResult } from '../types/benchmark';
import {
  formatDateTime,
  formatMegaBytes,
  formatTokensPerSec,
} from '../utils/format';

interface ResultDetailScreenProps {
  result: BenchmarkResult;
  onBack: () => void;
  onRunAgain: (result: BenchmarkResult) => void;
}

export const ResultDetailScreen: React.FC<ResultDetailScreenProps> = ({
  result,
  onBack,
  onRunAgain,
}) => {
  const { theme } = useAppTheme();
  const { results, deleteResult } = useHistoryStore();
  const [compareTarget, setCompareTarget] = useState<BenchmarkResult | null>(null);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const otherResults = results.filter((r: BenchmarkResult) => r.id !== result.id);

  const handleShare = async () => {
    const success = await exportService.shareResult(result);
    if (!success) {
      Alert.alert('Export result', exportService.generateJsonString(result));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete benchmark result',
      'Are you sure you want to delete this result permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteResult(result.id);
            onBack();
          },
        },
      ]
    );
  };

  const { summary, device, model, config, runs } = result;
  const isThrottled = summary?.thermal_throttled;

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      <Header
        title="Benchmark result"
        subtitle={`${model.name} (${model.quantization})`}
        leftActionLabel="Back"
        onLeftAction={onBack}
        rightElement={
          <AppIconButton
            icon={<AppIcon name="share" size={20} color={theme.colors.primary} />}
            onPress={handleShare}
            accessibilityLabel="Share benchmark result"
            size={36}
          />
        }
      />

      {/* Top Banner Card */}
      <Section>
        <AppCard highlight>
          <View style={styles.topHeaderRow}>
            <View style={styles.flex1}>
              <AppText variant="screenTitle" weight="500">
                {model.name}
              </AppText>
              <AppText variant="caption" color="tertiary" style={styles.topMeta}>
                {formatDateTime(result.timestamp_utc)}
              </AppText>
            </View>
            <View style={styles.badgeRow}>
              {result.is_partial ? (
                <Badge label="Incomplete" variant="warning" size="sm" />
              ) : null}
              <Badge label={model.quantization} variant="primary" />
            </View>
          </View>

          <AppDivider spacing={theme.spacing[12]} />

          <View style={styles.heroMetricRow}>
            <View style={styles.heroMetricBlock}>
              <AppText variant="microLabel" color="tertiary">
                Decode speed
              </AppText>
              <AppText
                variant="metricValue"
                weight="500"
                color="accent"
                style={styles.heroMetricVal}
              >
                {formatTokensPerSec(summary?.decode_tok_s_median || 0)}
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.heroMetricSub}>
                Median throughput
              </AppText>
            </View>

            <View style={styles.heroMetricBlock}>
              <AppText variant="microLabel" color="tertiary">
                Time to first token
              </AppText>
              <AppText
                variant="metricValue"
                weight="500"
                color="accent"
                style={styles.heroMetricVal}
              >
                {summary?.ttft_ms_median || 0}{' '}
                <AppText variant="secondary" color="tertiary">
                  ms
                </AppText>
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.heroMetricSub}>
                Min: {summary?.ttft_ms_min || 0} • Max: {summary?.ttft_ms_max || 0}
              </AppText>
            </View>
          </View>
        </AppCard>
      </Section>

      {/* Statistical Summary Table */}
      <Section
        title="Summary statistics"
        subtitle={`Computed across ${runs.filter((r) => !r.is_warmup).length} measured runs`}
      >
        <AppCard>
          <View style={styles.tableHeader}>
            <AppText variant="microLabel" color="tertiary" style={styles.col2}>
              Metric
            </AppText>
            <AppText
              variant="microLabel"
              color="tertiary"
              align="center"
              style={styles.col15}
            >
              Median
            </AppText>
            <AppText
              variant="microLabel"
              color="tertiary"
              align="right"
              style={styles.col15}
            >
              Range
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[4]} />

          <View style={styles.tableRow}>
            <AppText variant="secondary" color="secondary" style={styles.col2}>
              Decode throughput
            </AppText>
            <AppText
              variant="secondary"
              weight="500"
              color="accent"
              align="center"
              style={styles.col15}
            >
              {summary?.decode_tok_s_median || 0} t/s
            </AppText>
            <AppText variant="caption" color="tertiary" align="right" style={styles.col15}>
              {summary?.decode_tok_s_median || 0}
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[4]} />

          <View style={styles.tableRow}>
            <AppText variant="secondary" color="secondary" style={styles.col2}>
              Prefill throughput
            </AppText>
            <AppText
              variant="secondary"
              weight="500"
              color="accent"
              align="center"
              style={styles.col15}
            >
              {summary?.prefill_tok_s_median || 0} t/s
            </AppText>
            <AppText variant="caption" color="tertiary" align="right" style={styles.col15}>
              {summary?.prefill_tok_s_median || 0}
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[4]} />

          <View style={styles.tableRow}>
            <AppText variant="secondary" color="secondary" style={styles.col2}>
              Time to first token
            </AppText>
            <AppText
              variant="secondary"
              weight="500"
              align="center"
              style={styles.col15}
            >
              {summary?.ttft_ms_median || 0} ms
            </AppText>
            <AppText variant="caption" color="tertiary" align="right" style={styles.col15}>
              {summary?.ttft_ms_min || 0} / {summary?.ttft_ms_max || 0}
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[4]} />

          <View style={styles.tableRow}>
            <AppText variant="secondary" color="secondary" style={styles.col2}>
              Peak RAM (RSS)
            </AppText>
            <AppText
              variant="secondary"
              weight="500"
              align="center"
              style={styles.col15}
            >
              {formatMegaBytes(summary?.peak_rss_mb_median || 0)}
            </AppText>
            <AppText variant="caption" color="tertiary" align="right" style={styles.col15}>
              {summary?.peak_rss_mb_median || 0} MB
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[4]} />

          <View style={styles.tableRow}>
            <AppText variant="secondary" color="secondary" style={styles.col2}>
              Battery drain per run
            </AppText>
            <AppText
              variant="secondary"
              weight="500"
              color="danger"
              align="center"
              style={styles.col15}
            >
              {summary?.battery_per_run_pct_median || 0}%
            </AppText>
            <AppText variant="caption" color="tertiary" align="right" style={styles.col15}>
              ~{Math.round((summary?.battery_per_run_pct_median || 0) * 45)} mAh
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[4]} />

          <View style={styles.tableRow}>
            <AppText variant="secondary" color="secondary" style={styles.col2}>
              Thermal status
            </AppText>
            <View style={[styles.col15, styles.centerAlign]}>
              <Badge
                label={isThrottled ? 'Throttled' : 'Optimal'}
                variant={isThrottled ? 'danger' : 'success'}
                showDot
                size="sm"
              />
            </View>
            <AppText variant="caption" color="tertiary" align="right" style={styles.col15}>
              {isThrottled ? 'High temp' : 'Normal'}
            </AppText>
          </View>
        </AppCard>
      </Section>

      {/* Device & Configuration Cards */}
      <Section title="Environment and parameters">
        <View style={styles.infoRow}>
          <AppCard secondary style={styles.infoCard}>
            <AppText variant="secondary" weight="500" style={styles.cardSectionHead}>
              Device specs
            </AppText>
            <AppText variant="caption" color="secondary">
              Model: {device.manufacturer} {device.model}
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.mt2}>
              Chipset: {device.chipset}
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.mt2}>
              RAM: {device.ram_gb} GB
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.mt2}>
              OS: Android {device.android_version} ({device.abi})
            </AppText>
          </AppCard>

          <AppCard secondary style={styles.infoCard}>
            <AppText variant="secondary" weight="500" style={styles.cardSectionHead}>
              Run configuration
            </AppText>
            <AppText variant="caption" color="secondary">
              Threads: {config.threads}
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.mt2}>
              Context: {config.context_length} tok
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.mt2}>
              Generation: {config.generation_length} tok
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.mt2}>
              Prompts: {config.prompts_hash ? config.prompts_hash.substring(0, 10) : 'v1'}
            </AppText>
          </AppCard>
        </View>
      </Section>

      {/* Per-Run Detailed Breakdown Table */}
      <Section title="Per-run log" subtitle={`${runs.length} iterations captured chronologically`}>
        <AppCard>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={styles.runTableHeader}>
                <AppText variant="microLabel" color="tertiary" style={styles.colW45}>
                  #
                </AppText>
                <AppText variant="microLabel" color="tertiary" style={styles.colW65}>
                  Prompt
                </AppText>
                <AppText variant="microLabel" color="tertiary" style={styles.colW70}>
                  TTFT
                </AppText>
                <AppText variant="microLabel" color="tertiary" style={styles.colW75}>
                  Prefill
                </AppText>
                <AppText variant="microLabel" color="tertiary" style={styles.colW75}>
                  Decode
                </AppText>
                <AppText variant="microLabel" color="tertiary" style={styles.colW80}>
                  RAM
                </AppText>
                <AppText variant="microLabel" color="tertiary" style={styles.colW65}>
                  Battery
                </AppText>
                <AppText variant="microLabel" color="tertiary" style={styles.colW75}>
                  Thermal
                </AppText>
              </View>

              <AppDivider spacing={theme.spacing[4]} />

              {runs.map((r, idx) => (
                <View key={idx}>
                  {idx > 0 ? <AppDivider spacing={theme.spacing[4]} /> : null}
                  <View style={styles.runTableRow}>
                    <AppText variant="caption" weight="500" style={styles.colW45}>
                      {r.is_warmup ? 'W' : r.run_index}
                    </AppText>
                    <AppText variant="caption" color="secondary" style={styles.colW65}>
                      P{r.prompt_index + 1}
                    </AppText>
                    <AppText variant="caption" style={styles.colW70}>
                      {r.ttft_ms}ms
                    </AppText>
                    <AppText variant="caption" color="accent" style={styles.colW75}>
                      {r.prefill_tok_s}
                    </AppText>
                    <AppText variant="caption" weight="500" color="accent" style={styles.colW75}>
                      {r.decode_tok_s}
                    </AppText>
                    <AppText variant="caption" color="tertiary" style={styles.colW80}>
                      {r.peak_rss_mb} MB
                    </AppText>
                    <AppText variant="caption" color="danger" style={styles.colW65}>
                      {r.battery_delta_pct}%
                    </AppText>
                    <View style={styles.colW75}>
                      <Badge
                        label={r.thermal_state}
                        variant={
                          r.thermal_state === 'SEVERE' || r.thermal_state === 'CRITICAL'
                            ? 'danger'
                            : 'neutral'
                        }
                        size="sm"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </AppCard>
      </Section>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {otherResults.length > 0 ? (
          <AppButton
            variant="secondary"
            size="md"
            label="Compare with past session..."
            onPress={() => setIsPickerVisible(true)}
            style={styles.mb10}
          />
        ) : null}

        <AppButton
          variant="primary"
          size="lg"
          label="Benchmark again"
          icon={<AppIcon name="bolt" size={18} color="#000000" />}
          onPress={() => onRunAgain(result)}
        />

        <View style={styles.secondaryActions}>
          <AppButton
            variant="secondary"
            size="sm"
            label="Export JSON"
            icon={<AppIcon name="upload_file" size={16} color={theme.colors.textPrimary} />}
            onPress={handleShare}
            style={styles.exportBtn}
          />
          <AppButton
            variant="destructive"
            size="sm"
            label="Delete session"
            icon={<AppIcon name="delete" size={16} color={theme.colors.danger} />}
            onPress={handleDelete}
            style={styles.deleteBtn}
          />
        </View>
      </View>

      {/* Compare Target Picker Modal */}
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <View style={[styles.pickerOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: theme.colors.surfaceCard,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.pickerHeader}>
              <View style={styles.flex1}>
                <AppText variant="screenTitle" weight="500">
                  Select benchmark to compare
                </AppText>
                <AppText variant="caption" color="secondary" style={styles.pickerSubtitle}>
                  Comparing against {result.model.name} ({result.model.quantization})
                </AppText>
              </View>
              <AppIconButton
                icon={<AppIcon name="close" size={20} color={theme.colors.textPrimary} />}
                onPress={() => setIsPickerVisible(false)}
                accessibilityLabel="Close comparison picker"
                size={36}
              />
            </View>

            <ScrollView style={styles.pickerList}>
              {otherResults.map((r: BenchmarkResult) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.pickerItem,
                    {
                      backgroundColor: theme.colors.surfaceRaised,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.card,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => {
                    setIsPickerVisible(false);
                    setCompareTarget(r);
                  }}
                >
                  <View style={styles.pickerItemTop}>
                    <AppText variant="secondary" weight="500">
                      {r.model.name}
                    </AppText>
                    <Badge label={r.model.quantization} variant="primary" size="sm" />
                  </View>
                  <AppText variant="caption" color="tertiary" style={styles.pickerItemMeta}>
                    {formatTokensPerSec(r.summary.decode_tok_s_median)} • {r.config.threads} thr •{' '}
                    {formatDateTime(r.timestamp_utc)}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Side-by-side Compare View */}
      {compareTarget ? (
        <CompareModal
          visible={Boolean(compareTarget)}
          baseResult={result}
          targetResult={compareTarget}
          onClose={() => setCompareTarget(null)}
        />
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
  },
  flex1: {
    flex: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topMeta: {
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroMetricBlock: {
    flex: 1,
  },
  heroMetricVal: {
    marginTop: 2,
  },
  heroMetricSub: {
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  col2: {
    flex: 2,
  },
  col15: {
    flex: 1.5,
  },
  centerAlign: {
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 12,
  },
  cardSectionHead: {
    marginBottom: 6,
  },
  mt2: {
    marginTop: 2,
  },
  runTableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  runTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  colW45: {
    width: 45,
  },
  colW65: {
    width: 65,
  },
  colW70: {
    width: 70,
  },
  colW75: {
    width: 75,
  },
  colW80: {
    width: 80,
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  mb10: {
    marginBottom: 10,
  },
  secondaryActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  exportBtn: {
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    flex: 1,
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    height: '75%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerSubtitle: {
    marginTop: 2,
  },
  pickerList: {
    flex: 1,
  },
  pickerItem: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  pickerItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerItemMeta: {
    marginTop: 4,
  },
});
