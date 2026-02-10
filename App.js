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
  Platform
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';

// =====================================================
// KONFIGURACIJA
// =====================================================
const DEFAULT_API_URL = 'https://your-server.com/indicators';

// Demo podaci za prikaz kada server nije dostupan
const DEMO_DATA = Array.from({ length: 30 }, (_, i) => ({
  price: 95000 + Math.sin(i * 0.3) * 2000 + Math.random() * 500,
  rsi: 50 + Math.sin(i * 0.2) * 20 + Math.random() * 5,
  williams_r: -50 + Math.sin(i * 0.25) * 30 + Math.random() * 5,
  macd: Math.sin(i * 0.15) * 100 + Math.random() * 20,
}));

// =====================================================
// MAIN APP COMPONENT
// =====================================================
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState(DEFAULT_API_URL);

  // ===================================================
  // Data Fetching
  // ===================================================
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
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
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const json = await response.json();
      
      if (!Array.isArray(json) || json.length === 0) {
        throw new Error('No data received from server');
      }
      
      setData(json);
      setIsDemo(false);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.log('Using demo data - server unavailable');
      setData(DEMO_DATA);
      setIsDemo(true);
      setLoading(false);
      setError(null);
    }
  }, [apiUrl]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ===================================================
  // Render Helpers
  // ===================================================
  const getLatestValue = (field) => {
    if (!data || data.length === 0) return '--';
    return data[data.length - 1][field]?.toFixed(2) || '--';
  };

  const getSignal = () => {
    if (!data || data.length === 0) return { text: 'LOADING', color: '#999' };
    
    const latest = data[data.length - 1];
    const rsi = latest.rsi;
    const williams = latest.williams_r;
    
    if (rsi < 30 && williams < -80) {
      return { text: 'BUY', color: '#00ff88' };
    } else if (rsi > 70 && williams > -20) {
      return { text: 'SELL', color: '#ff4444' };
    }
    return { text: 'NEUTRAL', color: '#ffaa00' };
  };

  const renderChart = (title, dataKey, color) => {
    if (!data || data.length === 0) return null;
    
    const chartData = {
      labels: [],
      datasets: [{
        data: data.slice(-20).map(d => d[dataKey] || 0)
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#1a1a2e',
            backgroundGradientFrom: '#1a1a2e',
            backgroundGradientTo: '#16213e',
            decimalPlaces: 2,
            color: (opacity = 1) => color,
            style: {
              borderRadius: 16
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  // ===================================================
  // Render Loading/Error States
  // ===================================================
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  const signal = getSignal();

  // ===================================================
  // Main Render
  // ===================================================
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalLabel}>API Server URL:</Text>
            <TextInput
              style={styles.modalInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="https://your-server.com/indicators"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={() => {
                  setApiUrl(tempUrl);
                  setShowSettings(false);
                  setLoading(true);
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crypto Trading Dashboard</Text>
        <TouchableOpacity onPress={() => { setTempUrl(apiUrl); setShowSettings(true); }}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Demo Mode Banner */}
      {isDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            DEMO MODE - Tap ⚙️ to connect your server
          </Text>
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>CENA</Text>
            <Text style={styles.statusValue}>${getLatestValue('price')}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>RSI</Text>
            <Text style={styles.statusValue}>{getLatestValue('rsi')}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>SIGNAL</Text>
            <Text style={[styles.statusValue, { color: signal.color }]}>
              {signal.text}
            </Text>
          </View>
        </View>

        {/* Charts */}
        {renderChart('Price & BB', 'price', '#4ecdc4')}
        {renderChart('RSI', 'rsi', '#95e1d3')}
        {renderChart('Williams %R', 'williams_r', '#ffd93d')}
        {renderChart('MACD', 'macd', '#667eea')}

        {/* Info Message */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Free Version</Text>
          <Text style={styles.infoText}>
            Enjoy all features completely free!{'\n'}
            Connect your own trading server via Settings.
          </Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Refresh Button */}
      <TouchableOpacity style={styles.fab} onPress={onRefresh}>
        <Text style={styles.fabText}>🔄</Text>
      </TouchableOpacity>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  settingsIcon: {
    fontSize: 22,
    padding: 5,
  },
  demoBanner: {
    backgroundColor: '#ff6b35',
    padding: 8,
    alignItems: 'center',
  },
  demoBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingLeft: 5,
    color: '#fff',
  },
  chart: {
    borderRadius: 15,
  },
  loadingText: {
    marginTop: 10,
    color: '#aaa',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#333',
  },
  modalButtonSave: {
    backgroundColor: '#667eea',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
