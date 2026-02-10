import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';

// =====================================================
// KONFIGURACIJA
// =====================================================
const CONFIG = {
  // Backend API URL - zameni sa svojom IP adresom
  API_URL: 'http://192.168.1.230:5000/indicators',
  
  // Auto-refresh interval (ms)
  AUTO_REFRESH_INTERVAL: 30000 // 30 sekundi
};

// =====================================================
// MAIN APP COMPONENT
// =====================================================
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ===================================================
  // Data Fetching
  // ===================================================
  const fetchData = async () => {
    try {
      setError(null);
      
      // Create an abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(CONFIG.API_URL, {
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
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      
      // User-friendly error messages
      let errorMsg = 'Greška pri učitavanju podataka';
      if (err.name === 'AbortError') {
        errorMsg = 'Timeout: Server ne odgovara (10s)';
      } else if (err.message.includes('Network')) {
        errorMsg = 'Mrežna greška: Proverite konekciju';
      } else if (err.message.includes('Server error')) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

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
        <Text style={styles.loadingText}>Učitavam podatke...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
        </TouchableOpacity>
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Crypto Trading Dashboard</Text>
      </View>

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
        {renderChart('💰 Price & BB', 'price', '#4ecdc4')}
        {renderChart('📈 RSI', 'rsi', '#95e1d3')}
        {renderChart('📉 Williams %R', 'williams_r', '#ffd93d')}
        {renderChart('🔄 MACD', 'macd', '#667eea')}

        {/* Info Message */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>💡 Free Version</Text>
          <Text style={styles.infoText}>
            Uživaj u svim funkcijama potpuno besplatno!{'\n'}
            Premium features coming soon.
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
    textAlign: 'center',
    flex: 1,
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
});
