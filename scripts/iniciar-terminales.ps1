# VacunaGuard AI — Abre los 5 servicios en ventanas VISIBLES + Metro
# (para que el maestro vea las terminales corriendo, una por servicio)
$ErrorActionPreference = 'Continue'
$raiz = 'C:\Users\javie\OneDrive\Documentos\deepseek-harness\default-workspace'
$logs = Join-Path $raiz 'logs-demo'
New-Item -ItemType Directory -Force -Path $logs | Out-Null

$servicios = @(
  @('identity  (3001)', 'identity24.sh'),
  @('cold-chain (3002)', 'coldchain24.sh'),
  @('registry  (3003)', 'registry24.sh'),
  @('routes    (3004)', 'routes24.sh'),
  @('advisor   (3005)', 'advisor24.sh')
)
foreach ($s in $servicios) {
  $cmd = 'Write-Host "=== ' + $s[0] + ' ==="; wsl.exe -d Ubuntu -- bash /home/javii/' + $s[1]
  Start-Process 'powershell.exe' -ArgumentList '-NoProfile', '-NoExit', '-Command', $cmd
  Write-Host ('ventana abierta: ' + $s[0])
}

# Puente de puertos (oculto, sin ventana)
Start-Process 'node.exe' -ArgumentList (Join-Path $raiz 'wsl-scripts\relay-puertos.cjs') -WindowStyle Hidden

# Metro visible con el QR
$token = (Get-Content (Join-Path $env:USERPROFILE '.expo-token') -ErrorAction SilentlyContinue | Select-Object -First 1)
if ($token) { $env:EXPO_TOKEN = $token.Trim() }
$metroDir = Join-Path $raiz 'vacunaguard-app'
$cmdMetro = 'Write-Host "=== Metro (app movil) ==="; Set-Location "' + $metroDir + '"; npx expo start'
Start-Process 'powershell.exe' -ArgumentList '-NoProfile', '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', $cmdMetro

# App web en el navegador (terminal visible)
$cmdWeb = 'Write-Host "=== App web (laptop: http://localhost:8090) ==="; Set-Location "' + $raiz + 'vacunaguard-app"; npx expo export --platform web; npx --yes serve dist -l 8090'
Start-Process 'powershell.exe' -ArgumentList '-NoProfile', '-NoExit', '-ExecutionPolicy', 'Bypass', '-Command', $cmdWeb

Start-Sleep -Seconds 12
Write-Host ''
Write-Host '=== LISTO: 5 terminales de servicios + Metro + app web ===' -ForegroundColor Green
$ip = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*' } | Select-Object -First 1 -ExpandProperty IPAddress
Write-Host ('  App movil (Expo Go): exp://' + $ip + ':8081')
Write-Host '  Para apagar todo: scripts\detener-demo.ps1'
