@echo off
echo ============================================================
echo   BUILD APK ZA TESTIRANJE (BEZ GIT-A)
echo ============================================================
echo.
echo Building APK (Preview Mode)...
echo Ovo moze trajati 15-20 minuta - build se izvrsava u cloud-u!
echo.

set EAS_NO_VCS=1
call eas build --platform android --profile preview --non-interactive --no-wait

echo.
echo ============================================================
echo   BUILD POKR ENUT!
echo ============================================================
echo.
echo Proveri status build-a na: https://expo.dev
echo Link za download ce biti dostupan kada build zavrsi!
echo.
pause
