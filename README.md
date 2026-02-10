# 📱 CRYPTO TRADING DASHBOARD - PLAY STORE APP

## 🚀 BRZI START

### 1️⃣ Instalacija (JEDNOM)

```powershell
# Dupli klik na:
INSTALL.bat
```

Ili ručno:
```powershell
cd "f:\Ollama\CURSOR\NOVO\play_store_app"
npm install -g eas-cli expo-cli
npm install
```

---

### 2️⃣ Build APK za Testiranje

```powershell
# Dupli klik na:
BUILD_APK.bat
```

- Build se izvršava u **cloud-u** (ne treba Android Studio!)
- Trajanje: ~15-20 minuta
- Dobićeš link za download APK
- Instaliraj na telefon i testiraj

---

### 3️⃣ Build AAB za Google Play

```powershell
# Dupli klik na:
BUILD_AAB.bat
```

- Build AAB fajl za upload na Play Store
- Upload u Google Play Console

---

## 💰 ZARADA

Aplikacija ima **2 izvora prihoda:**

### 1. **AdMob Oglasi**
- Banner oglasi (dno ekrana)
- Interstitial oglasi (nakon refresh-a)
- **Zarada:** $1-5 per 1000 prikazanih oglasa

### 2. **Premium Verzija ($4.99)**
- Bez oglasa
- Unlimited notifikacije
- Napredne strategije
- **Zarada:** $3.49 po kupovini (nakon Google fee)

**Procena:** 1000 korisnika = **$225-375/mesec**

---

## 📋 ŠTA TREBA PRE OBJAVE

### ✅ Obavezno:

1. **Google Play Developer nalog** ($25 jednokratno)
   - https://play.google.com/console

2. **Google AdMob nalog** (besplatno)
   - https://admob.google.com
   - Kreiraj Ad Units
   - Zameni ID-eve u `App.js` (red ~23-24)

3. **Privacy Policy** (hosted online)
   - Generiši: https://www.freeprivacypolicy.com
   - Host: GitHub Pages / Google Sites

4. **Screenshots** (2-8 komada)
   - Testiraj APK na telefonu
   - Screenshot-uj dashboard
   - Ili koristi: https://mockuphone.com

5. **App Icon** (512x512 px PNG)
   - Koristi: https://www.canva.com
   - Crypto/chart tema

---

## 🔧 KONFIGURACIJA

### 1. Backend URL

U `App.js` (red ~21):
```javascript
API_URL: 'http://TVOJA_IP:5000/indicators',
```

Zameni sa IP adresom računara gde je Flask server.

### 2. AdMob IDs

U `App.js` (red ~24-25):
```javascript
ADMOB_BANNER_ID: 'ca-app-pub-XXXX/YYYY',
ADMOB_INTERSTITIAL_ID: 'ca-app-pub-XXXX/ZZZZ',
```

Dobićeš iz AdMob konzole.

### 3. App Bundle Identifier

U `app.json` (red ~21):
```json
"package": "com.yourcompany.cryptodashboard",
```

Zameni `yourcompany` sa tvojim imenom/kompanijom (lowercase, bez razmaka).

---

## 📊 FEATURES

✅ Real-time crypto indicators (RSI, MACD, Williams %R, Bollinger Bands)
✅ Interactive charts
✅ BUY/SELL/NEUTRAL signals
✅ Auto-refresh (30s)
✅ Pull-to-refresh
✅ AdMob integration
✅ Premium In-App Purchase
✅ Dark theme
✅ Professional UI/UX

---

## 📱 TESTIRANJE

### Na telefonu:

1. Build APK: `BUILD_APK.bat`
2. Download APK sa linka
3. Na telefonu:
   - Settings → Security → "Unknown sources" (Enable)
   - Download i instaliraj APK
4. Otvori app i testiraj

### Test checklist:
- [ ] App se otvara
- [ ] Podaci se učitavaju
- [ ] Charts se prikazuju
- [ ] Refresh radi
- [ ] Banner ad se prikazuje
- [ ] Premium purchase flow radi
- [ ] Signal detection radi

---

## 🎯 PLAY STORE SUBMISSION

### Optimizovani Store Listing:

**Short Description (80 chars):**
```
Real-time crypto indicators: RSI, MACD, Bollinger Bands. Trade smarter!
```

**Long Description:**
Pogledaj `GOOGLE_PLAY_VODIC.md` - sekcija "Store Listing"

**Keywords (ASO):**
```
crypto, trading, bitcoin, indicators, RSI, MACD, signals, 
chart, technical analysis, cryptocurrency, BTC, ETH
```

**Category:** Finance

**Target Age:** 18+

---

## 💡 MARKETING TIPS

### Organic Growth:
1. **App Store Optimization (ASO)**
   - Optimizuj keywords
   - High-quality screenshots
   - Professional description
   - Encourage reviews

2. **Social Media**
   - Reddit: r/cryptocurrency, r/cryptotrading
   - Twitter: crypto hashtags
   - YouTube: tutorial videos
   - TikTok: short demos

3. **Content Marketing**
   - Blog posts o crypto trading
   - Email newsletter
   - Trading signals na Telegram/Discord

### Paid Marketing:
- Google Ads: $500-1000 budget
- Target keywords: "crypto trading app", "bitcoin indicators"
- ROI tracking obavezan

---

## 📞 SUPPORT & RESOURCES

**Dokumentacija:**
- Expo: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- AdMob: https://support.google.com/admob
- Play Console: https://support.google.com/googleplay/android-developer

**Community:**
- Expo Discord: https://chat.expo.dev
- r/reactnative
- Stack Overflow

---

## 🐛 TROUBLESHOOTING

### "eas: command not found"
```powershell
npm install -g eas-cli
```

### Build fails
- Check `app.json` syntax (valid JSON)
- Verify package name uniqueness
- Check Expo account active

### Ads not showing
- Verify AdMob IDs
- Check AdMob account approved (može trajati 24h)
- Test IDs rade uvek (za testiranje)

### Backend not reachable
- Verify Flask server running
- Check IP address u `App.js`
- Telefon i računar na istoj WiFi mreži

---

## 🚀 NEXT STEPS

After successful launch:

### Week 1:
- Monitor crash reports
- Respond to reviews
- Fix critical bugs

### Month 1:
- Add push notifications
- Implement more indicators
- A/B test premium pricing

### Month 2-3:
- Multi-language support
- iOS version (double audience)
- Advanced features (alerts, portfolio tracking)

---

## 💰 REVENUE TRACKING

Monitor metrics:
- **DAU/MAU** (Daily/Monthly Active Users)
- **Ad impressions** (AdMob console)
- **CTR** (Click-Through Rate)
- **Premium conversion rate**
- **Retention** (Day 1, Day 7, Day 30)

Optimize based on data!

---

**READY TO LAUNCH? 🚀**

1. ✅ Run `INSTALL.bat`
2. ✅ Configure AdMob IDs
3. ✅ Test with `BUILD_APK.bat`
4. ✅ Build final AAB with `BUILD_AAB.bat`
5. ✅ Upload to Google Play
6. ✅ Start earning! 💸

---

**Questions?** Check `GOOGLE_PLAY_VODIC.md` for detailed guide!
