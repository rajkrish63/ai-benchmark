import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge } from '../components/Badge';
import { Header } from '../components/Header';
import { Screen } from '../components/layout/Screen';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppDivider } from '../components/ui/AppDivider';
import { AppIcon } from '../components/ui/AppIcon';
import { AppIconButton } from '../components/ui/AppIconButton';
import { AppInput } from '../components/ui/AppInput';
import { AppText } from '../components/ui/AppText';
import { useAppTheme } from '../hooks/useAppTheme';
import { useHistoryStore } from '../store/useHistoryStore';
import { BenchmarkResult } from '../types/benchmark';
import { formatDateTime, formatTokensPerSec } from '../utils/format';

interface HistoryScreenProps {
  onSelectResult: (result: BenchmarkResult) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onSelectResult }) => {
  const { theme } = useAppTheme();
  const {
    results,
    searchQuery,
    selectedModelFilter,
    loadResults,
    setSearchQuery,
    setModelFilter,
    clearAll,
    importResultJson,
  } = useHistoryStore();

  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Unique model names for filtering
  const modelNames: string[] = [
    'ALL',
    ...Array.from(new Set(results.map((r: BenchmarkResult) => r.model?.name).filter(Boolean))),
  ];

  const filteredResults = results.filter((r: BenchmarkResult) => {
    const q = searchQuery.toLowerCase().trim();
    const modelName = r.model?.name || '';
    const quantization = r.model?.quantization || '';
    const deviceModel = r.device?.model || '';

    const matchesSearch =
      q === '' ||
      modelName.toLowerCase().includes(q) ||
      quantization.toLowerCase().includes(q) ||
      deviceModel.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedModelFilter !== 'ALL' && modelName !== selectedModelFilter) {
      return false;
    }

    return true;
  });

  const handleClearAll = () => {
    if (results.length === 0) return;
    Alert.alert(
      'Clear all history',
      'Are you sure you want to permanently delete all benchmark results?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: clearAll,
        },
      ]
    );
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    try {
      const res = await importResultJson(importText.trim());
      setImportModalVisible(false);
      setImportText('');
      Alert.alert('Import successful', `Loaded result for ${res.model.name}.`, [
        { text: 'View result', onPress: () => onSelectResult(res) },
        { text: 'OK' },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON';
      Alert.alert('Import failed', msg);
    }
  };

  const renderItem = ({ item }: { item: BenchmarkResult }) => {
    const isThrottled = Boolean(item.summary?.thermal_throttled);

    return (
      <AppCard
        style={styles.historyCard}
        onPress={() => onSelectResult(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardModelInfo}>
            <AppText variant="body" weight="500">
              {item.model?.name || 'Unknown model'}
            </AppText>
            <View style={styles.badgeRow}>
              <Badge label={item.model?.quantization || 'Q4'} variant="primary" size="sm" />
              {item.is_partial ? (
                <Badge label="Incomplete" variant="warning" size="sm" />
              ) : null}
              <AppText variant="caption" color="tertiary">
                {formatDateTime(item.timestamp_utc)}
              </AppText>
            </View>
          </View>

          <View style={styles.scoreBlock}>
            <AppText variant="metricValue" weight="500" color="accent" align="right">
              {formatTokensPerSec(item.summary?.decode_tok_s_median || 0)}
            </AppText>
            <AppText variant="caption" color="tertiary" align="right">
              Median decode
            </AppText>
          </View>
        </View>

        <AppDivider spacing={theme.spacing[8]} />

        <View style={styles.cardBottom}>
          <AppText variant="caption" color="secondary" style={styles.cardMeta}>
            {item.config?.measured_runs || 0} runs • {item.config?.threads || 4} thr • TTFT:{' '}
            {item.summary?.ttft_ms_median || 0} ms
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
  };

  return (
    <Screen>
      <Header
        title="History"
        subtitle={`${results.length} recorded benchmarks`}
        rightActionLabel={results.length > 0 ? 'Clear all' : undefined}
        onRightAction={handleClearAll}
      />

      {/* Search & Actions Bar */}
      <View
        style={[
          styles.searchBarRow,
          { paddingHorizontal: theme.layout.screenHorizontal },
        ]}
      >
        <View style={styles.searchInputWrap}>
          <AppInput
            placeholder="Search history by model, device..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            rightElement={<AppIcon name="search" size={18} color={theme.colors.textTertiary} />}
            containerStyle={styles.noMarginBottom}
          />
        </View>
        <AppButton
          size="md"
          variant="secondary"
          label="Import"
          icon={<AppIcon name="upload_file" size={16} color={theme.colors.textPrimary} />}
          onPress={() => setImportModalVisible(true)}
          style={styles.importBtn}
        />
      </View>

      {/* Model Filter Pills */}
      {modelNames.length > 2 ? (
        <View style={styles.modelFilterContainer}>
          <FlatList<string>
            horizontal
            showsHorizontalScrollIndicator={false}
            data={modelNames}
            keyExtractor={(item: string) => item}
            contentContainerStyle={[
              styles.filterListContent,
              { paddingHorizontal: theme.layout.screenHorizontal },
            ]}
            renderItem={({ item }: { item: string }) => {
              const isSelected = selectedModelFilter === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primaryTint
                        : theme.colors.surfaceRaised,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderRadius: theme.radius.pill,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setModelFilter(item)}
                >
                  <AppText
                    variant="caption"
                    weight={isSelected ? '500' : '400'}
                    style={{
                      color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                    }}
                  >
                    {item === 'ALL' ? 'All models' : item}
                  </AppText>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}

      {/* History List */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: theme.layout.screenHorizontal },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppCard secondary style={styles.emptyCard}>
            <AppText variant="body" weight="500" align="center">
              No benchmark results yet
            </AppText>
            <AppText
              variant="secondary"
              color="tertiary"
              align="center"
              style={styles.emptySub}
            >
              Run a benchmark from the Home tab or import an exported JSON result.
            </AppText>
          </AppCard>
        }
      />

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surfaceCard,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <AppText variant="screenTitle" weight="500">
                  Import benchmark JSON
                </AppText>
                <AppText variant="caption" color="secondary" style={styles.modalSubtitle}>
                  Paste a PocketBench schema v1 JSON export below
                </AppText>
              </View>
              <AppIconButton
                icon={<AppIcon name="close" size={20} color={theme.colors.textPrimary} />}
                onPress={() => setImportModalVisible(false)}
                accessibilityLabel="Close import dialog"
                size={36}
              />
            </View>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.surfaceRaised,
                  borderColor: theme.colors.border,
                  color: theme.colors.textPrimary,
                  borderRadius: theme.radius.input,
                },
              ]}
              multiline
              placeholder='{"schema_version": 1, ...}'
              placeholderTextColor={theme.colors.textTertiary}
              value={importText}
              onChangeText={setImportText}
            />

            <View style={styles.modalActions}>
              <AppButton
                size="md"
                variant="secondary"
                label="Cancel"
                onPress={() => setImportModalVisible(false)}
                style={styles.cancelModalBtn}
              />
              <AppButton
                size="md"
                variant="primary"
                label="Validate and import"
                onPress={handleImport}
                disabled={!importText.trim()}
                style={styles.importConfirmBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    marginRight: 8,
  },
  noMarginBottom: {
    marginBottom: 0,
  },
  importBtn: {
    height: 44,
  },
  modelFilterContainer: {
    marginBottom: 12,
  },
  filterListContent: {
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  listContent: {
    paddingBottom: 48,
  },
  historyCard: {
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardModelInfo: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  scoreBlock: {
    alignItems: 'flex-end',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 36,
    marginTop: 16,
  },
  emptySub: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '75%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalSubtitle: {
    marginTop: 2,
  },
  modalInput: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
  },
  cancelModalBtn: {
    flex: 1,
    marginRight: 8,
  },
  importConfirmBtn: {
    flex: 1,
  },
});
