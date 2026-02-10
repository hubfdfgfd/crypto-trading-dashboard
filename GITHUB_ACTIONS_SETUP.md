# GitHub Actions Setup - Android Build

## 📱 Šta se dešava?

Kada pushiš kod na GitHub, **GitHub Actions automatski gradi Android APK** korišćenjem EAS Build servisa.

## 🚀 Kako da počneš:

### 1. **Pravi GitHub Account** (ako ga nemaš)
```
https://github.com/signup
```

### 2. **Kreiraj novi repozitorijum na GitHub**
- Idi na https://github.com/new
- Naziv: `crypto-trading-dashboard`
- Public (za lakši pristup)
- **Ne inicijalziuj sa README** (već imamo kod)

### 3. **Dodaj GitHub Token kao Secret**
GitHub Actions trebaju `EAS_TOKEN` da izvrši build:

```bash
# Prvo kreiraj EAS token (ako ga imaš)
eas secret:create --name EAS_TOKEN --value "tvoj-eas-token"
```

**Ili brže - direktno u GitHub:**

1. Idi na: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`
2. Naziv: `EAS_TOKEN`
3. Vrednost: (Trebam da ti dam EAS token - vidiš ga sa `eas whoami`)

### 4. **Push GitHub iz VS Code ili PowerShell:**

```powershell
cd f:\Ollama\CURSOR\NOVO\play_store_app

# Postavi GitHub URL (zameni sa tvojim)
git remote add origin https://github.com/buzer88/crypto-trading-dashboard.git
git branch -M main
git push -u origin main
```

## ⚡ Status Buildera

Kada pushiš kod:
1. GitHub Actions automatski startuje
2. Možeš videti progress na `Actions` tabu
3. EAS Build će kompajlirati APK u cloud-u (~10-15 min)
4. Finished APK moži preuzeti sa EAS Dashboard-a

## 📊 Gde je APK?

Nakon što se build završi:
1. EAS Dashboard: https://expo.dev/accounts/buzer88/builds
2. GitHub Artifacts: Na `Actions` tabu, download kao zip

## 🔐 EAS Token

Trebam da dobijem tvoj EAS token:

```powershell
cd f:\Ollama\CURSOR\NOVO\play_store_app
eas whoami
```

Biće prikazana vrednost - to ide kao GitHub Secret `EAS_TOKEN`.

---

**Sledeće korake? Kaži `ready` kada imaš GitHub repo kreiiran!** 🎯
