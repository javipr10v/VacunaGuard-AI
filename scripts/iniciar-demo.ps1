# VacunaGuard AI — Arranque de la demo en vivo (UN SOLO COMANDO)
# Uso: clic derecho > "Ejecutar con PowerShell", o:  powershell -ExecutionPolicy Bypass -File iniciar-demo.ps1
$ErrorActionPreference = 'Continue'
$raiz = 'C:\Users\javie\OneDrive\Documentos\deepseek-harness\default-workspace'
$logs = Join-Path $raiz 'logs-demo'
New-Item -ItemType Directory -Force -Path $logs | Out-Null

function IniciarWsl([string]$nombre, [string]$script) {
  $logOut = Join-Path $logs ($nombre + '.out.log')
  $logErr = Join-Path $logs ($nombre + '.err.log')
  Start-Process 'wsl.exe' -ArgumentList '-d', 'Ubuntu', '--', 'bash', ('/home/javii/' + $script) -RedirectStandardOutput $logOut -RedirectStandardError $logErr -WindowStyle Hidden
  Write-Host ('  [OK] ' + $nombre)
}

Write-Host ''
Write-Host '=== VacunaGuard AI : levantando la demo ===' -ForegroundColor Cyan
Write-Host 'Backend (5 servicios en WSL):'
IniciarWsl 'identity    (3001)' 'identity24.sh'
IniciarWsl 'cold-chain  (3002)' 'coldchain24.sh'
IniciarWsl 'registry    (3003)' 'registry24.sh'
IniciarWsl 'routes      (3004)' 'routes24.sh'
IniciarWsl 'advisor     (3005)' 'advisor24.sh'

Write-Host 'Puente de puertos (Windows -> WSL):'
Start-Process 'node.exe' -ArgumentList (Join-Path $raiz 'wsl-scripts\relay-puertos.cjs') -WindowStyle Hidden
Write-Host '  [OK] puente'

$token = (Get-Content (Join-Path $env:USERPROFILE '.expo-token') -ErrorAction SilentlyContinue | Select-Object -First 1)
$metroDir = Join-Path $raiz 'vacunaguard-app'
$cmdMetro = '$env:EXPO_TOKEN="' + $token.Trim() + '"; Set-Location "' + $metroDir + '"; npx expo start'
Start-Process 'powershell.exe' -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $cmdMetro -WindowStyle Hidden
Write-Host '  [OK] Metro (modo desarrollo, con sesion de Expo)'


Start-Sleep -Seconds 14

$ip = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' } |
  Select-Object -First 1 -ExpandProperty IPAddress
if (-not $ip) { $ip = '127.0.0.1' }

Write-Host ''
Write-Host '=== LISTO PARA LA DEMO ===' -ForegroundColor Green
Write-Host ('  Abre en Expo Go (iPhone):  exp://' + $ip + ':8081')
Write-Host '  La primera compilacion tarda ~40 segundos.'
Write-Host '  Admin: correo y contrasena en services/identity-service/.env'
Write-Host '  Logs: ' + $logs
