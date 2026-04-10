$ErrorActionPreference = "SilentlyContinue"

Write-Host "[AURA] Preparing Tauri dev environment..."

$portConnections = Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $portConnections) {
  if ($pid -and $pid -ne $PID) {
    try {
      Stop-Process -Id $pid -Force
      Write-Host "[AURA] Released port 3000 from PID $pid"
    } catch {
      Write-Host "[AURA] Could not stop PID $pid on port 3000"
    }
  }
}

$appProcesses = Get-Process app
foreach ($process in $appProcesses) {
  if ($process.Id -ne $PID) {
    try {
      Stop-Process -Id $process.Id -Force
      Write-Host "[AURA] Closed stale app.exe PID $($process.Id)"
    } catch {
      Write-Host "[AURA] Could not close app.exe PID $($process.Id)"
    }
  }
}

Write-Host "[AURA] Tauri dev environment is ready."
