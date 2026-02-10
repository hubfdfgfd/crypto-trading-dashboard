import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';
import { PremiumProvider, usePremium } from './src/PremiumContext';
import PaywallScreen from './src/PaywallScreen';

// =====================================================
// CONFIGURATION
// =====================================================
const DEFAULT_API_URL = 'https://your-server.com/indicators';

// Demo data when server is unavailable
const DEMO_DATA = Array.from({ length: 50 }, (_, i) => ({
  price: 95000 + Math.sin(i * 0.3) * 2000 + Math.random() * 500,
  rsi: 50 + Math.sin(i * 0.2) * 20 + Math.random() * 5,
  williams_r: -50 + Math.sin(i * 0.25) * 30 + Math.random() * 5,
  macd: Math.sin(i * 0.15) * 100 + Math.random() * 20,
}));

// Chart definitions
const CHARTS = [
  { key: 'price', title: 'Price & BB', color: '#4ecdc4', premium: false },
  { key: 'rsi', title: 'RSI', color: '#95e1d3', premium: false },
  { key: 'williams_r', title: 'Williams %R', color: '#ffd93d', premium: true },
  { key: 'macd', title: 'MACD', color: '#667eea', premium: true },
];

// =====================================================
// DASHBOARD COMPONENT
// =====================================================
function Dashboard() {
  const { isPremium, features } = usePremium();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [tempUrl, setTempUrl] = useState(DEFAULT_API_URL);

  // ===================================================
  // Data Fetching
  // ===================================================
  const fetchData = useCallback(async () => {
    try {
      if (!features.serverConnection && apiUrl === DEFAULT_API_URL) {
        throw new Error('Demo mode');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const json = await response.json();
      if (!Array.isArray(json) || json.length === 0) throw new Error('No data');

      setData(json);
      setIsDemo(false);
      setLoading(false);
    } catch (err) {
      setData(DEMO_DATA);
      setIsDemo(true);
      setLoading(false);
    }
  }, [apiUrl, features.serverConnection]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, features.refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, features.refreshInterval]);

  // ===================================================
  // Helpers
  // ===================================================
  const getLatestValue = (field) => {
    if (!data || data.length === 0) return '--';
    return data[data.length - 1][field]?.toFixed(2) || '--';
  };

  const getSignal = () => {
    if (!data || data.length === 0) return { text: 'LOADING', color: '#999' };
    const latest = data[data.length - 1];
    if (latest.rsi < 30 && latest.williams_r < -80) return { text: 'BUY', color: '#00ff88' };
    if (latest.rsi > 70 && latest.williams_r > -20) return { text: 'SELL', color: '#ff4444' };
    return { text: 'NEUTRAL', color: '#ffaa00' };
  };

  const renderChart = (title, dataKey, color) => {
    if (!data || data.length === 0) return null;
    const points = data.slice(-features.maxDataPoints).map(d => d[dataKey] || 0);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={{ labels: [], datasets: [{ data: points }] }}
          width={Dimensions.get('window').width - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#1a1a2e',
            backgroundGradientFrom: '#1a1a2e',
            backgroundGradientTo: '#16213e',
            decimalPlaces: 2,
            color: () => color,
            style: { borderRadius: 16 },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderLockedChart = (title) => (
    <TouchableOpacity
      style={styles.lockedChart}
      onPress={() => setShowPaywall(true)}
      activeOpacity={0.7}
    >
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.lockedTitle}>{title}</Text>
      <Text style={styles.lockedSubtitle}>Premium Feature</Text>
      <View style={styles.unlockBtn}>
        <Text style={styles.unlockBtnText}>Unlock with Premium</Text>
      </View>
    </TouchableOpacity>
  );

  // ===================================================
  // Loading
  // ===================================================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  const signal = getSignal();

  // ===================================================
  // Render
  // ===================================================
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <PaywallScreen visible={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide" onRequestClose={() => setShowSettings(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>

            {!isPremium && (
              <TouchableOpacity
                style={styles.settingsPremium}
                onPress={() => { setShowSettings(false); setShowPaywall(true); }}
              >
                <Text style={styles.settingsPremiumText}>Upgrade to Premium for server connection</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.modalLabel}>API Server URL:</Text>
            <TextInput
              style={[styles.modalInput, !isPremium && { opacity: 0.4 }]}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="https://your-server.com/indicators"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
              editable={isPremium}
            />
            {!isPremium && <Text style={styles.modalHint}>Server connection requires Premium</Text>}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#333' }]} onPress={() => setShowSettings(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#667eea' }, !isPremium && { opacity: 0.4 }]}
                onPress={() => { if (isPremium) { setApiUrl(tempUrl); setShowSettings(false); setLoading(true); } }}
                disabled={!isPremium}
              >
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crypto Trading Dashboard</Text>
        {isPremium && <Text style={styles.proBadge}>PRO</Text>}
        <TouchableOpacity onPress={() => { setTempUrl(apiUrl); setShowSettings(true); }}>
          <Text style={{ fontSize: 22, padding: 5 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Banner */}
      {isDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            DEMO MODE {!isPremium ? '- Upgrade to connect server' : '- Configure in Settings'}
          </Text>
        </View>
      )}

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Status */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>PRICE</Text>
            <Text style={styles.statusValue}>${getLatestValue('price')}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>RSI</Text>
            <Text style={styles.statusValue}>{getLatestValue('rsi')}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>SIGNAL</Text>
            <Text style={[styles.statusValue, { color: signal.color }]}>{signal.text}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>REFRESH</Text>
            <Text style={styles.statusValue}>{features.refreshInterval / 1000}s</Text>
          </View>
        </View>

        {/* Charts */}
        {CHARTS.map((c) =>
          c.premium && !isPremium
            ? <View key={c.key}>{renderLockedChart(c.title)}</View>
            : <View key={c.key}>{renderChart(c.title, c.key, c.color)}</View>
        )}

        {/* Upgrade Banner */}
        {!isPremium && (
          <TouchableOpacity style={styles.upgradeBanner} onPress={() => setShowPaywall(true)} activeOpacity={0.8}>
            <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
            <Text style={styles.upgradeText}>Unlock all charts, faster refresh, server connection & more</Text>
            <View style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>View Plans</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{isPremium ? 'Premium Active' : 'Free Version'}</Text>
          <Text style={styles.infoText}>
            {isPremium
              ? 'All premium features unlocked. Thank you for your support!'
              : 'Upgrade to Premium for all charts, 10s refresh, and server connection.'}
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onRefresh}>
        <Text style={{ fontSize: 24 }}>🔄</Text>
      </TouchableOpacity>
    </View>
  );
}

// =====================================================
// APP WITH PROVIDER
// =====================================================
export default function App() {
  return (
    <PremiumProvider>
      <Dashboard />
    </PremiumProvider>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  loadingText: { marginTop: 10, color: '#aaa', fontSize: 16 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
  proBadge: { backgroundColor: '#667eea', color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 10, overflow: 'hidden' },

  // Demo Banner
  demoBanner: { backgroundColor: '#ff6b35', padding: 8, alignItems: 'center' },
  demoBannerText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  // Status Bar
  statusBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.05)', margin: 15, padding: 15, borderRadius: 15 },
  statusItem: { alignItems: 'center' },
  statusLabel: { fontSize: 10, color: '#aaa', marginBottom: 5 },
  statusValue: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  // Charts
  chartContainer: { backgroundColor: 'rgba(255,255,255,0.05)', margin: 15, padding: 15, borderRadius: 15 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, paddingLeft: 5, color: '#fff' },
  chart: { borderRadius: 15 },

  // Locked Chart
  lockedChart: { backgroundColor: 'rgba(255,255,255,0.03)', margin: 15, padding: 30, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(102,126,234,0.3)', borderStyle: 'dashed' },
  lockIcon: { fontSize: 36, marginBottom: 10 },
  lockedTitle: { fontSize: 18, fontWeight: 'bold', color: '#667eea', marginBottom: 5 },
  lockedSubtitle: { fontSize: 13, color: '#666', marginBottom: 15 },
  unlockBtn: { backgroundColor: '#667eea', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  unlockBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // Upgrade Banner
  upgradeBanner: { backgroundColor: 'rgba(102,126,234,0.15)', margin: 15, padding: 25, borderRadius: 15, borderWidth: 2, borderColor: '#667eea', alignItems: 'center' },
  upgradeTitle: { fontSize: 20, fontWeight: 'bold', color: '#667eea', marginBottom: 8 },
  upgradeText: { fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 15, lineHeight: 20 },
  upgradeBtn: { backgroundColor: '#667eea', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  upgradeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  // Info Box
  infoBox: { backgroundColor: 'rgba(102,126,234,0.1)', margin: 15, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(102,126,234,0.3)' },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#667eea', marginBottom: 10, textAlign: 'center' },
  infoText: { fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 22 },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#667eea', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

  // Settings Modal
  settingsPremium: { backgroundColor: 'rgba(102,126,234,0.2)', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#667eea' },
  settingsPremiumText: { color: '#667eea', textAlign: 'center', fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 25, width: '85%', borderWidth: 1, borderColor: '#667eea' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  modalLabel: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#333', marginBottom: 5 },
  modalHint: { color: '#ff6b35', fontSize: 11, marginBottom: 15, marginLeft: 5 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  modalBtnText: { color: '#fff', fontWeight: 'bold' },
});
