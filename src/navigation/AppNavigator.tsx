import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import { TabBar, TabKey } from '../components/TabBar';
import { BenchmarkScreen } from '../screens/BenchmarkScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ModelsScreen } from '../screens/ModelsScreen';
import { ResultDetailScreen } from '../screens/ResultDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useBenchmarkStore } from '../store/useBenchmarkStore';
import { BenchmarkResult } from '../types/benchmark';
import { useAppTheme } from '../hooks/useAppTheme';

export const AppNavigator: React.FC = () => {
  const { theme } = useAppTheme();
  const [currentTab, setCurrentTab] = useState<TabKey>('Home');
  const [selectedResult, setSelectedResult] = useState<BenchmarkResult | null>(null);
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);

  const { setSelectedModel, setConfig } = useBenchmarkStore();

  useEffect(() => {
    const onBackPress = () => {
      if (selectedResult) {
        setSelectedResult(null);
        return true;
      }
      if (isBenchmarkModalOpen) {
        const liveStatus = useBenchmarkStore.getState().liveState.status;
        const isRunning =
          liveStatus !== 'IDLE' &&
          liveStatus !== 'COMPLETED' &&
          liveStatus !== 'CANCELLED' &&
          liveStatus !== 'ERROR';

        if (isRunning) {
          Alert.alert(
            'Cancel Benchmark?',
            'A benchmark is actively running. Any completed runs will be saved in partial results.',
            [
              { text: 'Keep Running', style: 'cancel' },
              {
                text: 'Cancel Benchmark',
                style: 'destructive',
                onPress: () => {
                  useBenchmarkStore.getState().cancelBenchmark();
                  setIsBenchmarkModalOpen(false);
                },
              },
            ]
          );
          return true;
        }

        setIsBenchmarkModalOpen(false);
        return true;
      }

      if (currentTab !== 'Home') {
        setCurrentTab('Home');
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [selectedResult, isBenchmarkModalOpen, currentTab]);

  const handleRunAgain = (result: BenchmarkResult) => {
    useBenchmarkStore.getState().resetLiveState();
    setSelectedModel(result.model);
    setConfig({
      threads: result.config.threads,
      context_length: result.config.context_length,
      generation_length: result.config.generation_length,
      measured_runs: result.config.measured_runs,
    });
    setSelectedResult(null);
    setIsBenchmarkModalOpen(true);
  };

  const handleBenchmarkComplete = (result: BenchmarkResult) => {
    setIsBenchmarkModalOpen(false);
    setSelectedResult(result);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.screenContainer}>
        {selectedResult ? (
          <ResultDetailScreen
            result={selectedResult}
            onBack={() => setSelectedResult(null)}
            onRunAgain={handleRunAgain}
          />
        ) : isBenchmarkModalOpen ? (
          <BenchmarkScreen
            onClose={() => setIsBenchmarkModalOpen(false)}
            onBenchmarkComplete={handleBenchmarkComplete}
          />
        ) : (
          <>
            {currentTab === 'Home' ? (
              <HomeScreen
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenBenchmark={() => setIsBenchmarkModalOpen(true)}
                onSelectResult={(result) => setSelectedResult(result)}
              />
            ) : null}

            {currentTab === 'Models' ? (
              <ModelsScreen
                onOpenBenchmarkForModel={() => setIsBenchmarkModalOpen(true)}
              />
            ) : null}

            {currentTab === 'History' ? (
              <HistoryScreen
                onSelectResult={(result) => setSelectedResult(result)}
              />
            ) : null}

            {currentTab === 'Settings' ? <SettingsScreen /> : null}
          </>
        )}
      </View>

      {/* Show Bottom TabBar only when not inside a fullscreen benchmark or result screen */}
      {!isBenchmarkModalOpen && !selectedResult ? (
        <TabBar currentTab={currentTab} onSelectTab={setCurrentTab} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenContainer: {
    flex: 1,
  },
});

