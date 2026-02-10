@echo off
echo ============================================================
echo   BUILD APK ZA TESTIRANJE
echo ============================================================
echo.
echo Login u Expo nalog...
call eas login
echo.
echo Building APK (Preview Mode)...
echo Ovo moze trajati 15-20 minuta - build se izvrsava u cloud-u!
echo.

set EAS_NO_VCS=1
call eas build --platform android --profile preview --non-interactive

echo.
echo ============================================================
echo   BUILD ZAVRSEN!
echo ============================================================
echo.
echo Download APK sa linka iznad i instaliraj na telefon!
echo.
pause
