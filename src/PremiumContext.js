import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

// =====================================================
// RevenueCat Configuration
// =====================================================
// Replace with your RevenueCat API key from https://app.revenuecat.com
const REVENUECAT_API_KEY = Platform.select({
  android: 'YOUR_REVENUECAT_GOOGLE_API_KEY',
  ios: 'YOUR_REVENUECAT_APPLE_API_KEY',
});

// Product IDs - must match Google Play Console in-app products
export const PRODUCTS = {
  MONTHLY: 'crypto_dashboard_monthly',    // $4.99/month
  YEARLY: 'crypto_dashboard_yearly',      // $29.99/year (save 50%)
};

// =====================================================
// Premium Features Definition
// =====================================================
export const FEATURES = {
  FREE: {
    charts: ['price', 'rsi'],
    refreshInterval: 60000,   // 60 seconds
    serverConnection: false,
    alerts: false,
    maxDataPoints: 10,
  },
  PREMIUM: {
    charts: ['price', 'rsi', 'williams_r', 'macd'],
    refreshInterval: 10000,   // 10 seconds
    serverConnection: true,
    alerts: true,
    maxDataPoints: 50,
  },
};

// =====================================================
// Context
// =====================================================
const PremiumContext = createContext();

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [Purchases, setPurchases] = useState(null);

  // Initialize RevenueCat
  useEffect(() => {
    const init = async () => {
      try {
        const RC = require('react-native-purchases').default;
        setPurchases(RC);

        if (REVENUECAT_API_KEY && !REVENUECAT_API_KEY.startsWith('YOUR_')) {
          RC.configure({ apiKey: REVENUECAT_API_KEY });

          // Check current subscription status
          const customerInfo = await RC.getCustomerInfo();
          const isActive = customerInfo.entitlements.active['premium'] !== undefined;
          setIsPremium(isActive);

          // Get available packages
          try {
            const offerings = await RC.getOfferings();
            if (offerings.current) {
              setPackages(offerings.current.availablePackages);
            }
          } catch (e) {
            console.log('Could not fetch offerings:', e.message);
          }

          // Listen for subscription changes
          RC.addCustomerInfoUpdateListener((info) => {
            setIsPremium(info.entitlements.active['premium'] !== undefined);
          });
        } else {
          console.log('RevenueCat not configured - running in free mode');
        }
      } catch (e) {
        console.log('RevenueCat not available:', e.message);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Purchase a package
  const purchasePackage = async (pkg) => {
    if (!Purchases) {
      Alert.alert('Not Available', 'In-app purchases are not available in this build.');
      return false;
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive = customerInfo.entitlements.active['premium'] !== undefined;
      setIsPremium(isActive);
      return isActive;
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Error', e.message);
      }
      return false;
    }
  };

  // Restore purchases
  const restorePurchases = async () => {
    if (!Purchases) {
      Alert.alert('Not Available', 'In-app purchases are not available in this build.');
      return false;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      const isActive = customerInfo.entitlements.active['premium'] !== undefined;
      setIsPremium(isActive);

      if (isActive) {
        Alert.alert('Restored!', 'Your premium subscription has been restored.');
      } else {
        Alert.alert('No Subscription', 'No active premium subscription found.');
      }
      return isActive;
    } catch (e) {
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
      return false;
    }
  };

  const features = isPremium ? FEATURES.PREMIUM : FEATURES.FREE;

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        features,
        packages,
        purchasePackage,
        restorePurchases,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
}
