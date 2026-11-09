import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge } from '../components/Badge';
import { Header } from '../components/Header';
import { Screen } from '../components/layout/Screen';
import { ProgressBar } from '../components/ProgressBar';
import { SegmentedControl } from '../components/SegmentedControl';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppDivider } from '../components/ui/AppDivider';
import { AppIcon } from '../components/ui/AppIcon';
import { AppInput } from '../components/ui/AppInput';
import { AppText } from '../components/ui/AppText';
import { useAppTheme } from '../hooks/useAppTheme';
import { useBenchmarkStore } from '../store/useBenchmarkStore';
import { useModelsStore } from '../store/useModelsStore';
import { CuratedModel, QuantizationVariant } from '../types/model';
import { formatDurationSeconds, formatMegaBytes } from '../utils/format';

interface ModelsScreenProps {
  onOpenBenchmarkForModel: () => void;
}

export const ModelsScreen: React.FC<ModelsScreenProps> = ({
  onOpenBenchmarkForModel,
}) => {
  const { theme } = useAppTheme();
  const {
    curatedModels,
    downloads,
    selectedFilter,
    searchQuery,
    loadModels,
    setFilter,
    setSearchQuery,
    downloadVariant,
    cancelDownload,
    deleteModelVariant,
    isVariantDownloaded,
    getLocalVariant,
  } = useModelsStore();

  const { setSelectedModel } = useBenchmarkStore();
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const filteredModels = curatedModels.filter((model: CuratedModel) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      model.name.toLowerCase().includes(query) ||
      model.params.toLowerCase().includes(query) ||
      model.architecture.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    const hasAnyDownloaded = model.variants.some((v: QuantizationVariant) =>
      isVariantDownloaded(model.id, v.quantization)
    );

    if (selectedFilter === 'DOWNLOADED') {
      return hasAnyDownloaded;
    }
    if (selectedFilter === 'NEW') {
      return !hasAnyDownloaded;
    }
    return true;
  });

  const handleDownload = (model: CuratedModel, variant: QuantizationVariant) => {
    downloadVariant(model.id, model.name, variant);
  };

  const handleDelete = (model: CuratedModel, variant: QuantizationVariant) => {
    Alert.alert(
      'Delete model variant',
      `Are you sure you want to delete ${model.name} (${variant.quantization})? This will free ${formatMegaBytes(variant.size_mb)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteModelVariant(model.id, variant.quantization),
        },
      ]
    );
  };

  const handleQuickBenchmark = (model: CuratedModel, variant: QuantizationVariant) => {
    const local = getLocalVariant(model.id, variant.quantization);
    useBenchmarkStore.getState().resetLiveState();
    setSelectedModel({
      name: model.name,
      params: model.params,
      quantization: variant.quantization,
      gguf_size_mb: variant.size_mb,
      source_url: variant.download_url,
      sha256: variant.sha256,
      local_path: local?.local_path || `/data/user/0/com.pocketbenchapp/files/models/${variant.file_name}`,
    });
    onOpenBenchmarkForModel();
  };

  const filterOptions = ['ALL', 'DOWNLOADED', 'NEW'] as const;
  const filterLabels = {
    ALL: 'All models',
    DOWNLOADED: 'Downloaded',
    NEW: 'Available',
  };

  const renderModelCard = ({ item }: { item: CuratedModel }) => {
    const isExpanded = expandedModelId === item.id;

    return (
      <AppCard style={styles.modelCard}>
        {/* Model card header */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setExpandedModelId(isExpanded ? null : item.id)}
          style={styles.cardHeaderRow}
        >
          <View style={styles.cardTitleBlock}>
            <View style={styles.modelNameRow}>
              <AppText variant="sectionTitle" weight="500" style={styles.modelNameText}>
                {item.name}
              </AppText>
              <Badge label={item.params} variant="primary" size="sm" />
            </View>
            <AppText variant="caption" color="secondary" style={styles.modelMetaText}>
              {item.architecture} • Context: {item.context_window.toLocaleString()} tokens
            </AppText>
          </View>
          <AppIcon
            name={isExpanded ? 'close' : 'info'}
            size={18}
            color={theme.colors.textTertiary}
          />
        </TouchableOpacity>

        <AppText
          variant="secondary"
          color="secondary"
          numberOfLines={isExpanded ? undefined : 2}
          style={styles.descriptionText}
        >
          {item.description}
        </AppText>

        {isExpanded ? (
          <View
            style={[
              styles.metaDetailsBox,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
              },
            ]}
          >
            <AppText variant="caption" color="tertiary">
              Repository: <AppText variant="caption" weight="500" color="primary">{item.hf_repo}</AppText>
            </AppText>
            <AppText variant="caption" color="tertiary" style={styles.ramReqText}>
              RAM required:{' '}
              <AppText variant="caption" weight="500" color="primary">
                {item.min_ram_gb} GB (Recommended: {item.recommended_ram_gb} GB)
              </AppText>
            </AppText>
          </View>
        ) : null}

        <AppDivider spacing={theme.spacing[12]} />

        {/* Quantization variants list */}
        <View style={styles.variantsContainer}>
          <AppText
            variant="microLabel"
            color="tertiary"
            style={styles.variantsTitle}
          >
            Available quantizations
          </AppText>

          {item.variants.map((variant, index) => {
            const downloadKey = `${item.id}:${variant.quantization}`;
            const download = downloads[downloadKey];
            const isDownloaded = isVariantDownloaded(item.id, variant.quantization);
            const isDownloading = download && download.status === 'DOWNLOADING';
            const isVerifying = download && download.status === 'VERIFYING';

            return (
              <View key={variant.quantization}>
                {index > 0 ? <AppDivider spacing={theme.spacing[8]} /> : null}
                <View style={styles.variantRow}>
                  <View style={styles.variantLeft}>
                    <View style={styles.variantHeader}>
                      <Badge
                        label={variant.quantization}
                        variant={isDownloaded ? 'success' : 'neutral'}
                        showDot={isDownloaded}
                        size="sm"
                      />
                      <AppText variant="caption" color="tertiary" style={styles.variantSize}>
                        {formatMegaBytes(variant.size_mb)}
                      </AppText>
                    </View>

                    {isDownloading ? (
                      <View style={styles.progressContainer}>
                        <ProgressBar
                          progress={download.percentage}
                          showLabel
                          subtext={`${download.speed_mbps} MB/s • ETA ${formatDurationSeconds(download.eta_seconds)}`}
                          height={6}
                        />
                      </View>
                    ) : isVerifying ? (
                      <AppText variant="caption" color="warning" style={styles.verifyingText}>
                        Verifying SHA-256 integrity...
                      </AppText>
                    ) : null}
                  </View>

                  {/* Variant actions */}
                  <View style={styles.variantActions}>
                    {isVerifying ? (
                      <AppButton
                        size="sm"
                        variant="secondary"
                        label="Verifying..."
                        loading
                        disabled
                        onPress={() => {}}
                      />
                    ) : isDownloading ? (
                      <AppButton
                        size="sm"
                        variant="destructive"
                        label="Cancel"
                        onPress={() => cancelDownload(item.id, variant.quantization)}
                      />
                    ) : isDownloaded ? (
                      <View style={styles.downloadedActionsRow}>
                        <AppButton
                          size="sm"
                          variant="secondary"
                          label="Benchmark"
                          icon={<AppIcon name="bolt" size={14} color={theme.colors.primary} />}
                          onPress={() => handleQuickBenchmark(item, variant)}
                          style={styles.benchmarkBtn}
                        />
                        <AppButton
                          size="sm"
                          variant="ghost"
                          label="Delete"
                          onPress={() => handleDelete(item, variant)}
                        />
                      </View>
                    ) : (
                      <AppButton
                        size="sm"
                        variant="primary"
                        label="Download"
                        icon={<AppIcon name="download" size={14} color="#000000" />}
                        onPress={() => handleDownload(item, variant)}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </AppCard>
    );
  };

  return (
    <Screen>
      <Header
        title="Models"
        subtitle="Curated GGUF weights for on-device inference"
        rightActionLabel="Refresh"
        onRightAction={loadModels}
      />

      {/* Search and Filter */}
      <View style={{ paddingHorizontal: theme.layout.screenHorizontal }}>
        <AppInput
          placeholder="Search models (Phi-3, Gemma, 1.5B)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          rightElement={<AppIcon name="search" size={18} color={theme.colors.textTertiary} />}
        />

        <SegmentedControl
          options={[...filterOptions]}
          selectedValue={selectedFilter}
          onSelect={(f) => setFilter(f)}
          formatOption={(f) => filterLabels[f]}
          style={styles.filterControl}
        />
      </View>

      {/* Model list */}
      <FlatList
        data={filteredModels}
        keyExtractor={(item) => item.id}
        renderItem={renderModelCard}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: theme.layout.screenHorizontal },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <AppCard secondary style={styles.emptyCard}>
            <AppText variant="body" weight="500" align="center">
              No matching models found
            </AppText>
            <AppText
              variant="secondary"
              color="tertiary"
              align="center"
              style={styles.emptySub}
            >
              Try adjusting your search query or switching filters.
            </AppText>
          </AppCard>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 48,
  },
  modelCard: {
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  modelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modelNameText: {
    marginRight: 8,
  },
  modelMetaText: {
    marginTop: 2,
  },
  descriptionText: {
    marginTop: 8,
  },
  metaDetailsBox: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
  },
  ramReqText: {
    marginTop: 4,
  },
  variantsContainer: {
    marginTop: 4,
  },
  variantsTitle: {
    marginBottom: 8,
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  variantLeft: {
    flex: 1,
    marginRight: 12,
  },
  variantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  variantSize: {
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 6,
  },
  verifyingText: {
    marginTop: 4,
  },
  variantActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benchmarkBtn: {
    marginRight: 6,
  },
  filterControl: {
    marginVertical: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
  },
  emptySub: {
    marginTop: 4,
  },
});
