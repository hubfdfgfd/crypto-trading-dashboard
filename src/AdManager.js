import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { usePremium } from './PremiumContext';

// AdMob Unit IDs
const AD_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-6221937757841885/8073125509',
    ios: 'ca-app-pub-6221937757841885/8073125509', // Replace with iOS ID if needed
  }),
  interstitial: Platform.select({
    android: 'ca-app-pub-6221937757841885/4238558368',
    ios: 'ca-app-pub-6221937757841885/4238558368',
  }),
};

// Test IDs for development builds
const TEST_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  }),
  interstitial: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  }),
};

// Set to false for production
const USE_TEST_ADS = __DEV__;

function getAdId(type) {
  return USE_TEST_ADS ? TEST_IDS[type] : AD_IDS[type];
}

// =====================================================
// Banner Ad Component (shows at bottom for free users)
// =====================================================
export function BannerAd() {
  const { isPremium } = usePremium();
  const [AdComponent, setAdComponent] = useState(null);

  useEffect(() => {
    if (isPremium) return;

    try {
      const ads = require('react-native-google-mobile-ads');
      const { BannerAd: RNBannerAd, BannerAdSize } = ads;

      setAdComponent(() => (
        <View style={styles.bannerContainer}>
          <RNBannerAd
            unitId={getAdId('banner')}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdFailedToLoad={(error) => console.log('Banner ad failed:', error)}
          />
        </View>
      ));
    } catch (e) {
      console.log('AdMob not available:', e.message);
    }
  }, [isPremium]);

  if (isPremium) return null;
  return AdComponent || <View style={styles.bannerPlaceholder} />;
}

// =====================================================
// Interstitial Ad Hook (shows between actions for free)
// =====================================================
let interstitialAd = null;
let interstitialLoaded = false;

export function useInterstitialAd() {
  const { isPremium } = usePremium();
  const showCountRef = useRef(0);

  useEffect(() => {
    if (isPremium) return;

    try {
      const ads = require('react-native-google-mobile-ads');
      const { InterstitialAd, AdEventType } = ads;

      interstitialAd = InterstitialAd.createForAdRequest(getAdId('interstitial'), {
        requestNonPersonalizedAdsOnly: true,
      });

      const loadListener = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        interstitialLoaded = true;
      });

      const closeListener = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        interstitialLoaded = false;
        // Preload next ad
        interstitialAd.load();
      });

      interstitialAd.load();

      return () => {
        loadListener();
        closeListener();
      };
    } catch (e) {
      console.log('Interstitial ads not available:', e.message);
    }
  }, [isPremium]);

  // Show interstitial every N actions (not too aggressive)
  const maybeShowInterstitial = () => {
    if (isPremium) return;

    showCountRef.current += 1;
    // Show an interstitial every 5 refreshes
    if (showCountRef.current % 5 === 0 && interstitialLoaded && interstitialAd) {
      interstitialAd.show();
    }
  };

  return { maybeShowInterstitial };
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingVertical: 2,
  },
  bannerPlaceholder: {
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
});
