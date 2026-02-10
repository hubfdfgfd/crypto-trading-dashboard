import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { usePremium } from './PremiumContext';

export default function PaywallScreen({ visible, onClose }) {
  const { packages, purchasePackage, restorePurchases, isLoading } = usePremium();

  const handlePurchase = async (pkg) => {
    const success = await purchasePackage(pkg);
    if (success) {
      onClose();
    }
  };

  const getPackageInfo = (pkg) => {
    const id = pkg.product.identifier;
    if (id.includes('yearly')) {
      return {
        title: 'Yearly',
        badge: 'BEST VALUE',
        badgeColor: '#00ff88',
        price: pkg.product.priceString || '$29.99',
        period: '/year',
        savings: 'Save 50%',
      };
    }
    return {
      title: 'Monthly',
      badge: null,
      price: pkg.product.priceString || '$4.99',
      period: '/month',
      savings: null,
    };
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock the full power of crypto trading analysis
            </Text>

            {/* Features comparison */}
            <View style={styles.featuresBox}>
              <Text style={styles.featuresTitle}>PREMIUM FEATURES</Text>
              
              <FeatureRow icon="noads" text="No Ads" free={false} premium={true} />
              <FeatureRow icon="chart" text="All 4 charts (Price, RSI, Williams %R, MACD)" free={false} premium={true} />
              <FeatureRow icon="speed" text="10-second real-time refresh" free={false} premium={true} />
              <FeatureRow icon="server" text="Connect your own trading server" free={false} premium={true} />
              <FeatureRow icon="bell" text="Buy/Sell signal alerts" free={false} premium={true} />
              <FeatureRow icon="data" text="50 data points per chart" free={false} premium={true} />
              
              <View style={styles.divider} />
              <Text style={styles.featuresTitle}>FREE FEATURES</Text>
              
              <FeatureRow icon="chart" text="Price & RSI charts (live data)" free={true} premium={true} />
              <FeatureRow icon="live" text="Live BTC data from CoinGecko" free={true} premium={true} />
              <FeatureRow icon="signal" text="Basic buy/sell signals" free={true} premium={true} />
            </View>

            {/* Package options */}
            {isLoading ? (
              <ActivityIndicator size="large" color="#667eea" style={{ marginVertical: 20 }} />
            ) : packages.length > 0 ? (
              <View style={styles.packagesContainer}>
                {packages.map((pkg) => {
                  const info = getPackageInfo(pkg);
                  return (
                    <TouchableOpacity
                      key={pkg.identifier}
                      style={[
                        styles.packageCard,
                        info.badge && styles.packageCardHighlighted,
                      ]}
                      onPress={() => handlePurchase(pkg)}
                    >
                      {info.badge && (
                        <View style={[styles.badge, { backgroundColor: info.badgeColor }]}>
                          <Text style={styles.badgeText}>{info.badge}</Text>
                        </View>
                      )}
                      <Text style={styles.packageTitle}>{info.title}</Text>
                      <Text style={styles.packagePrice}>
                        {info.price}
                        <Text style={styles.packagePeriod}>{info.period}</Text>
                      </Text>
                      {info.savings && (
                        <Text style={styles.packageSavings}>{info.savings}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.packagesContainer}>
                {/* Fallback when RevenueCat not configured */}
                <TouchableOpacity
                  style={styles.packageCard}
                  onPress={() => handlePurchase(null)}
                >
                  <Text style={styles.packageTitle}>Monthly</Text>
                  <Text style={styles.packagePrice}>
                    $4.99<Text style={styles.packagePeriod}>/month</Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.packageCard, styles.packageCardHighlighted]}
                  onPress={() => handlePurchase(null)}
                >
                  <View style={[styles.badge, { backgroundColor: '#00ff88' }]}>
                    <Text style={styles.badgeText}>BEST VALUE</Text>
                  </View>
                  <Text style={styles.packageTitle}>Yearly</Text>
                  <Text style={styles.packagePrice}>
                    $29.99<Text style={styles.packagePeriod}>/year</Text>
                  </Text>
                  <Text style={styles.packageSavings}>Save 50%</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Restore & Close */}
            <TouchableOpacity style={styles.restoreButton} onPress={restorePurchases}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Maybe Later</Text>
            </TouchableOpacity>

            <Text style={styles.legalText}>
              Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.
              Manage subscriptions in Google Play Store settings.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function FeatureRow({ text, free, premium }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureText}>{text}</Text>
      <View style={styles.featureIcons}>
        <Text style={[styles.featureCheck, !free && styles.featureCross]}>
          {free ? '✓' : '✗'}
        </Text>
        <Text style={[styles.featureCheck, !premium && styles.featureCross]}>
          {premium ? '✓' : '✗'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#1a1a2e',
    margin: 15,
    borderRadius: 25,
    padding: 25,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 25,
  },
  featuresBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
    letterSpacing: 1,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  featureText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },
  featureIcons: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-around',
  },
  featureCheck: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureCross: {
    color: '#ff4444',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
  },
  packagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  packageCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  packageCardHighlighted: {
    borderColor: '#667eea',
    borderWidth: 2,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
  },
  badge: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  packageTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 8,
  },
  packagePrice: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  packagePeriod: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: 'normal',
  },
  packageSavings: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  restoreButton: {
    alignItems: 'center',
    padding: 12,
  },
  restoreText: {
    color: '#667eea',
    fontSize: 14,
  },
  closeButton: {
    alignItems: 'center',
    padding: 12,
  },
  closeText: {
    color: '#666',
    fontSize: 14,
  },
  legalText: {
    color: '#555',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
  },
});
