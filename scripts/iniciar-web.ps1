# VacunaGuard AI — App en el navegador (http://localhost:9090)
# Usa la puerta de enlace: sirve la app web Y las APIs de los 5 servicios.
$raiz = 'C:\Users\javie\OneDrive\Documentos\deepseek-harness\default-workspace'
Write-Host 'Compilando la app web...'
Set-Location (Join-Path $raiz 'vacunaguard-app')
$env:EXPO_PUBLIC_API_BASE = '/api'
npx expo export --platform web
Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 1
Start-Process 'node.exe' -ArgumentList (Join-Path $raiz 'wsl-scripts\proxy-publico.cjs') -WindowStyle Hidden
Write-Host ''
Write-Host '=== APP WEB LISTA ===' -ForegroundColor Green
Write-Host '  Abre en la laptop: http://localhost:9090'
