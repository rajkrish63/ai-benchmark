import React, { useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { Screen } from '../components/layout/Screen';
import { Section } from '../components/layout/Section';
import { SegmentedControl } from '../components/SegmentedControl';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppDivider } from '../components/ui/AppDivider';
import { AppIcon } from '../components/ui/AppIcon';
import { AppText } from '../components/ui/AppText';
import { useAppTheme } from '../hooks/useAppTheme';
import { useHistoryStore } from '../store/useHistoryStore';
import { useModelsStore } from '../store/useModelsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { LocalModel, LocalModelVariant } from '../types/model';
import {
  APP_NAME,
  APP_VERSION,
  CONTEXT_LENGTH_OPTIONS,
  GENERATION_LENGTH_OPTIONS,
  MEASURED_RUNS_OPTIONS,
  SCHEMA_VERSION,
  THREAD_OPTIONS,
} from '../utils/constants';
import { formatMegaBytes } from '../utils/format';

export const SettingsScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { localModels, loadModels, clearAllLocalModels } = useModelsStore();
  const { results, loadResults, clearAll } = useHistoryStore();

  useEffect(() => {
    loadSettings();
    loadModels();
    loadResults();
  }, [loadSettings, loadModels, loadResults]);

  let totalModelSizeMb = 0;
  localModels.forEach((m: LocalModel) => {
    m.variants.forEach((v: LocalModelVariant) => {
      totalModelSizeMb += v.size_mb;
    });
  });

  const handleClearModels = () => {
    if (localModels.length === 0) return;
    Alert.alert(
      'Delete all models',
      `Are you sure you want to delete all downloaded GGUF weights? This will free ${formatMegaBytes(totalModelSizeMb)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: async () => {
            await clearAllLocalModels();
          },
        },
      ]
    );
  };

  const handleClearResults = () => {
    Alert.alert(
      'Clear all results',
      'Are you sure you want to delete all saved benchmark results? This action cannot be undone.',
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

  return (
    <Screen scrollable contentContainerStyle={styles.content}>
      <Header
        title="Settings"
        subtitle="Benchmark preferences and device execution controls"
      />

      {/* Appearance / Theme (Pure Black Dark-Only) */}
      <Section title="Appearance" subtitle="System interface theme">
        <AppCard>
          <View style={styles.themeInfoRow}>
            <View style={styles.themeBadgeIcon}>
              <AppIcon name="settings" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.themeTextWrap}>
              <AppText variant="secondary" weight="500">
                Pure black (OLED)
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.themeSub}>
                Infinite contrast, zero backlighting, and optimal battery efficiency during on-device inference.
              </AppText>
            </View>
          </View>
        </AppCard>
      </Section>

      {/* Benchmark Defaults */}
      <Section
        title="Benchmark defaults"
        subtitle="Default parameters pre-selected when initiating a benchmark run"
      >
        <AppCard>
          <SegmentedControl
            label="Default threads"
            options={THREAD_OPTIONS}
            selectedValue={settings.default_threads}
            onSelect={(t) => updateSettings({ default_threads: t })}
            formatOption={(t) => `${t} threads`}
          />

          <AppDivider spacing={theme.spacing[12]} />

          <SegmentedControl
            label="Default measured runs"
            options={MEASURED_RUNS_OPTIONS}
            selectedValue={settings.default_measured_runs}
            onSelect={(r) => updateSettings({ default_measured_runs: r })}
            formatOption={(r) => `${r} runs`}
          />

          <AppDivider spacing={theme.spacing[12]} />

          <SegmentedControl
            label="Default context length"
            options={CONTEXT_LENGTH_OPTIONS}
            selectedValue={settings.default_context_length}
            onSelect={(c) => updateSettings({ default_context_length: c })}
            formatOption={(c) => `${c} tokens`}
          />

          <AppDivider spacing={theme.spacing[12]} />

          <SegmentedControl
            label="Default generation length"
            options={GENERATION_LENGTH_OPTIONS}
            selectedValue={settings.default_generation_length}
            onSelect={(g) => updateSettings({ default_generation_length: g })}
            formatOption={(g) => `${g} tokens`}
          />
        </AppCard>
      </Section>

      {/* Execution Behavior */}
      <Section title="Execution behavior" subtitle="Hardware and system power controls">
        <AppCard>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelBlock}>
              <AppText variant="secondary" weight="500">
                Keep screen awake
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.switchSub}>
                Holds CPU partial wake lock to prevent sleep during benchmark runs.
              </AppText>
            </View>
            <Switch
              value={settings.keep_screen_on}
              onValueChange={(val) => updateSettings({ keep_screen_on: val })}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={settings.keep_screen_on ? '#FFFFFF' : theme.colors.textTertiary}
            />
          </View>

          <AppDivider />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelBlock}>
              <AppText variant="secondary" weight="500">
                Show progress notification
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.switchSub}>
                Foreground service notification with live progress for long benchmark suites.
              </AppText>
            </View>
            <Switch
              value={settings.show_notifications}
              onValueChange={(val) => updateSettings({ show_notifications: val })}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={settings.show_notifications ? '#FFFFFF' : theme.colors.textTertiary}
            />
          </View>

          <AppDivider />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelBlock}>
              <AppText variant="secondary" weight="500">
                Auto-export JSON
              </AppText>
              <AppText variant="caption" color="secondary" style={styles.switchSub}>
                Automatically prompt to export schema v1 JSON after each run completes.
              </AppText>
            </View>
            <Switch
              value={settings.auto_export}
              onValueChange={(val) => updateSettings({ auto_export: val })}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={settings.auto_export ? '#FFFFFF' : theme.colors.textTertiary}
            />
          </View>
        </AppCard>
      </Section>

      {/* Storage Information */}
      <Section title="Storage and data" subtitle="Local model files and saved sessions">
        <AppCard>
          <View style={styles.infoRow}>
            <AppText variant="secondary" color="secondary">
              Downloaded models:
            </AppText>
            <AppText variant="secondary" weight="500">
              {formatMegaBytes(totalModelSizeMb)}
            </AppText>
          </View>

          <AppDivider />

          <View style={styles.infoRow}>
            <AppText variant="secondary" color="secondary">
              Saved benchmark sessions:
            </AppText>
            <AppText variant="secondary" weight="500">
              {results.length} sessions
            </AppText>
          </View>

          {localModels.length > 0 ? (
            <AppButton
              variant="destructive"
              size="sm"
              label={`Delete all downloaded models (${formatMegaBytes(totalModelSizeMb)})`}
              icon={<AppIcon name="delete" size={16} color={theme.colors.danger} />}
              onPress={handleClearModels}
              style={styles.deleteModelsBtn}
            />
          ) : null}

          <AppButton
            variant="secondary"
            size="sm"
            label="Clear all saved results"
            onPress={handleClearResults}
            style={localModels.length > 0 ? styles.mt8 : styles.deleteModelsBtn}
          />
        </AppCard>
      </Section>

      {/* About */}
      <Section title={`About ${APP_NAME}`}>
        <AppCard>
          <View style={styles.aboutHeaderRow}>
            <View
              style={[
                styles.aboutLogoBadge,
                {
                  backgroundColor: theme.colors.surfaceRaised,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppIcon name="bolt" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.aboutTitleWrap}>
              <AppText variant="secondary" weight="500">
                {APP_NAME}
              </AppText>
              <AppText variant="caption" color="tertiary">
                Mobile LLM Evaluation Framework
              </AppText>
            </View>
          </View>

          <AppText variant="secondary" color="secondary" style={styles.aboutText}>
            {APP_NAME} is an on-device mobile LLM benchmarking suite designed to capture reproducible metrics (load time, TTFT, prefill, decode tok/s, peak RSS, battery delta, thermal throttling) on Android hardware.
          </AppText>

          <AppDivider spacing={theme.spacing[12]} />

          <View style={styles.infoRow}>
            <AppText variant="caption" color="tertiary">
              App version:
            </AppText>
            <AppText variant="caption" weight="500" color="accent">
              v{APP_VERSION}
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[8]} />

          <View style={styles.infoRow}>
            <AppText variant="caption" color="tertiary">
              JSON schema:
            </AppText>
            <AppText variant="caption" weight="500" color="accent">
              v{SCHEMA_VERSION}
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[8]} />

          <View style={styles.infoRow}>
            <AppText variant="caption" color="tertiary">
              Inference engine:
            </AppText>
            <AppText variant="caption" weight="500">
              llama.cpp (GGUF)
            </AppText>
          </View>

          <AppDivider spacing={theme.spacing[8]} />

          <View style={styles.infoRow}>
            <AppText variant="caption" color="tertiary">
              License:
            </AppText>
            <AppText variant="caption" weight="500">
              MIT / Apache 2.0
            </AppText>
          </View>
        </AppCard>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
  },
  themeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeBadgeIcon: {
    marginRight: 12,
  },
  themeTextWrap: {
    flex: 1,
  },
  themeSub: {
    marginTop: 2,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabelBlock: {
    flex: 1,
    marginRight: 16,
  },
  switchSub: {
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutLogoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aboutTitleWrap: {
    flex: 1,
  },
  aboutText: {
    lineHeight: 22,
  },
  deleteModelsBtn: {
    marginTop: 16,
  },
  mt8: {
    marginTop: 8,
  },
});
