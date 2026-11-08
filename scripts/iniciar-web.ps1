# VacunaGuard AI — App en el navegador de la laptop (http://localhost:8090)
$appDir = 'C:\Users\javie\OneDrive\Documentos\deepseek-harness\default-workspace\vacunaguard-app'
$cmd = 'Set-Location "' + $appDir + '"; npx expo export --platform web; npx --yes serve dist -l 8090'
Start-Process 'powershell.exe' -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $cmd
Start-Sleep -Seconds 25
Write-Host ''
Write-Host '=== APP WEB LISTA ===' -ForegroundColor Green
Write-Host '  Abre en la laptop: http://localhost:8090'
Write-Host '  (usa el backend local, no necesita celular)'
