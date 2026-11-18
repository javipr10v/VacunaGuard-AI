# VacunaGuard AI — Exponer el sistema a internet con HTTPS (un enlace)
# Requisito: cloudflared.exe en esta carpeta y la puerta de enlace (9090) corriendo.
$raiz = 'C:\Users\javie\OneDrive\Documentos\deepseek-harness\default-workspace'
Write-Host '=== 1. Puerta de enlace (web + APIs en 9090) ===' -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 9090 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Process 'node.exe' -ArgumentList (Join-Path $raiz 'wsl-scripts\proxy-publico.cjs') -WindowStyle Hidden
Start-Sleep -Seconds 2
Write-Host '=== 2. Tunel HTTPS (Cloudflare) ===' -ForegroundColor Cyan
Start-Process 'powershell.exe' -ArgumentList '-NoProfile', '-NoExit', '-Command', ('& "' + (Join-Path $raiz 'wsl-scripts\cloudflared.exe') + '" tunnel --url http://localhost:9090 --protocol http2 --no-autoupdate')
Start-Sleep -Seconds 12
Write-Host ''
Write-Host 'Listo. El enlace publico aparece en la ventana nueva (https://...trycloudflare.com)' -ForegroundColor Green
Write-Host 'Enviaselo a tu profesor: funciona en celular y computadora, con candadito HTTPS.' -ForegroundColor Green
