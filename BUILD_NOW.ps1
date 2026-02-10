# PowerShell script za build APK
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  BUILD APK ZA TESTIRANJE" -ForegroundColor Cyan
Write-Host "============================================================" -Fore groundColor Cyan
Write-Host ""

Set-Location "f:\Ollama\CURSOR\NOVO\play_store_app"
$env:EAS_NO_VCS = "1"

Write-Host "Building APK (Preview Mode)..." -ForegroundColor Yellow
Write-Host "Ovo moze trajati 15-20 minuta - build se izvrsava u cloud-u!" -ForegroundColor Yellow
Write-Host ""

eas build --platform android --profile preview

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  BUILD ZAVRSEN!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Download APK sa linka iznad i instaliraj na telefon!" -ForegroundColor Green
Write-Host ""
Read-Host "Pritisni Enter za nastavak"
