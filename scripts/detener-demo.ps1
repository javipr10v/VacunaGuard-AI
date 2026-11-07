# VacunaGuard AI — Detener la demo
$ErrorActionPreference = 'Continue'
Write-Host 'Deteniendo Metro y puente (Windows)...'
foreach ($puerto in @(8081, 3001, 3002, 3003, 3004, 3005)) {
  Get-NetTCPConnection -LocalPort $puerto -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalAddress -eq '0.0.0.0' -or $_.LocalAddress -eq '::' } |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Write-Host 'Deteniendo servicios (WSL)...'
wsl.exe -d Ubuntu -- bash -lc "pkill -f 'dist/main' 2>/dev/null; sleep 1; echo DETENIDO"
Write-Host 'Listo. Los contenedores Docker siguen vivos (bases, RabbitMQ, n8n, Ollama).'
