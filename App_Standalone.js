import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';

// =====================================================
// MOCK DATA GENERATOR - Realistični crypto podaci
// =====================================================
const generateMockData = () => {
  const data = [];
  let basePrice = 43000;
  
  for (let i = 0; i < 100; i++) {
    // Simuliramo realističko kretanje cene
    const change = (Math.random() - 0.5) * 500;
    basePrice += change;
    
    const close = basePrice;
    const high = basePrice + Math.abs(Math.random() * 200);
    const low = basePrice - Math.abs(Math.random() * 200);
    
    // Simulirani indikatori
    const rsi = 30 + Math.random() * 40; // RSI između 30-70
    const macd = (Math.random() - 0.5) * 100;
    const macd_signal = macd + (Math.random() - 0.5) * 20;
    const williams_r = -100 + Math.random() * 100;
    const bb_high = close + Math.abs(Math.random() * 300);
    const bb_low = close - Math.abs(Math.random() * 300);
    
    data.push({
      close,
      high,
      low,
      rsi,
      macd,
      macd_signal,
      williams_r,
      bb_high,
      bb_low,
      price: close,
      timestamp: new Date(Date.now() - (100 - i) * 3600000).toISOString()
    });
  }
  
  return data;
};

// =====================================================
// MAIN APP COMPONENT
// =====================================================
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ===================================================
  // Generate Mock Data
  // ===================================================
  const loadData = () => {
    setLoading(true);
    // Simuliramo fetch delay
    setTimeout(() => {
      const mockData = generateMockData();
      setData(mockData);
      setLoading(false);
      setRefreshing(false);
    }, 500);
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh svakih 30 sekundi sa novim podacima
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ===================================================
  // Chart Configuration
  // ===================================================
  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientTo: '#08130D',
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const screenWidth = Dimensions.get('window').width;

  // ===================================================
  // Chart Data Preparation
  // ===================================================
  const prepareChartData = (indicator) => {
    if (!data) return { labels: [], datasets: [{ data: [0] }] };
    
    const slicedData = data.slice(-20); // Poslednjih 20 tacaka
    return {
      labels: slicedData.map((_, i) => i % 5 === 0 ? `${i}` : ''),
      datasets: [{
        data: slicedData.map(d => {
          const value = d[indicator];
          return value !== null && !isNaN(value) ? value : 0;
        })
      }]
    };
  };

  // ===================================================
  // Rendering
  // ===================================================
  if (loading && !data) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.loadingText}>Učitavanje podataka...</Text>
      </View>
    );
  }

  const latestData = data[data.length - 1];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚀 Crypto Dashboard</Text>
        <Text style={styles.headerSubtitle}>DEMO MODE - Mock Data</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Current Price */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>BTC/USD</Text>
          <Text style={styles.priceValue}>
            ${latestData.price.toFixed(2)}
          </Text>
          <Text style={styles.priceChange}>
            {latestData.price > data[data.length - 2].price ? '📈' : '📉'} Mock Data
          </Text>
        </View>

        {/* Indicators Summary */}
        <View style={styles.indicatorsGrid}>
          <View style={styles.indicatorBox}>
            <Text style={styles.indicatorLabel}>RSI</Text>
            <Text style={styles.indicatorValue}>
              {latestData.rsi?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles.indicatorBox}>
            <Text style={styles.indicatorLabel}>Williams %R</Text>
            <Text style={styles.indicatorValue}>
              {latestData.williams_r?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles.indicatorBox}>
            <Text style={styles.indicatorLabel}>MACD</Text>
            <Text style={styles.indicatorValue}>
              {latestData.macd?.toFixed(2) || 'N/A'}
            </Text>
          </View>
          <View style={styles.indicatorBox}>
            <Text style={styles.indicatorLabel}>BB High</Text>
            <Text style={styles.indicatorValue}>
              ${latestData.bb_high?.toFixed(0) || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Charts */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📊 Price Chart</Text>
          <LineChart
            data={prepareChartData('price')}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📈 RSI Indicator</Text>
          <LineChart
            data={prepareChartData('rsi')}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📉 MACD Indicator</Text>
          <LineChart
            data={prepareChartData('macd')}
            width={screenWidth - 40}
            height={220}
            chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`}}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>💹 Williams %R</Text>
          <LineChart
            data={prepareChartData('williams_r')}
            width={screenWidth - 40}
            height={220}
            chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`}}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ⚠️ Demo Mode: Podaci su simulirani
          </Text>
          <Text style={styles.footerText}>
            Auto-refresh: 30s
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ===================================================
// Styles
// ===================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
  priceCard: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  priceLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  priceValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 10,
  },
  priceChange: {
    fontSize: 14,
    color: '#888',
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  indicatorBox: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    width: '45%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  indicatorLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  indicatorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  chartContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 15,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
});
