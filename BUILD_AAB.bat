@echo off
echo ============================================================
echo   BUILD AAB ZA GOOGLE PLAY STORE
echo ============================================================
echo.
echo UPOZORENJE: Ovo je produkcioni build!
echo Pre ovoga proverite:
echo   1. AdMob ID-evi postavljeni
echo   2. App testiran na telefonu (APK)
echo   3. Google Play Developer nalog placen ($25)
echo.
set /p answer=Nastavi build? (Y/N): 
if /i "%answer%" NEQ "Y" goto :EOF
echo.
echo Login u Expo nalog...
call eas login
echo.
echo Building AAB (Production Mode)...
echo Ovo moze trajati 15-20 minuta - build se izvrsava u cloud-u!
echo.

set EAS_NO_VCS=1
call eas build --platform android --profile production --non-interactive

echo.
echo ============================================================
echo   BUILD ZAVRSEN!
echo ============================================================
echo.
echo Download AAB fajl i upload na Google Play Console!
echo.
pause
