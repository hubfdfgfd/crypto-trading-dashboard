@echo off
echo ============================================================
echo   CRYPTO TRADING APP - GOOGLE PLAY BUILD
echo ============================================================
echo.
echo [KORAK 1] Instalacija globalnih alata...
echo.

call npm install -g eas-cli

echo.
echo [KORAK 2] Instalacija dependencies...
echo.

call npm install

echo.
echo ============================================================
echo   DEPENDENCIES INSTALIRANI!
echo ============================================================
echo.
echo Sledeci koraci:
echo.
echo 1. Registruj se na AdMob (https://admob.google.com)
echo 2. Kreiraj Ad Units i zameni ID-eve u App.js
echo 3. Pokreni: BUILD_APK.bat za testiranje
echo 4. Pokreni: BUILD_AAB.bat za Google Play
echo.
echo Detaljne instrukcije: GOOGLE_PLAY_VODIC.md
echo.
pause
