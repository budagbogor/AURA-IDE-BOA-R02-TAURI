$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$packageJsonPath = Join-Path $repoRoot "package.json"
$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
$version = $packageJson.version
$releaseDir = Join-Path $repoRoot "releases\windows"

Push-Location $repoRoot
try {
  Write-Host "[AURA] Building Tauri release for version $version..."
  npm run build:tauri
  if ($LASTEXITCODE -ne 0) {
    throw "Tauri build failed with exit code $LASTEXITCODE"
  }

  New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

  $nsisSource = Join-Path $repoRoot "src-tauri\target\release\bundle\nsis\AURA AI IDE_${version}_x64-setup.exe"
  $msiSource = Join-Path $repoRoot "src-tauri\target\release\bundle\msi\AURA AI IDE_${version}_x64_en-US.msi"

  if (-not (Test-Path -LiteralPath $nsisSource)) {
    throw "NSIS installer not found: $nsisSource"
  }

  if (-not (Test-Path -LiteralPath $msiSource)) {
    throw "MSI installer not found: $msiSource"
  }

  $nsisTarget = Join-Path $releaseDir "AURA-AI-IDE_v${version}_x64-setup.exe"
  $msiTarget = Join-Path $releaseDir "AURA-AI-IDE_v${version}_x64.msi"
  $manifestPath = Join-Path $releaseDir "AURA-AI-IDE_v${version}.json"

  Copy-Item -LiteralPath $nsisSource -Destination $nsisTarget -Force
  Copy-Item -LiteralPath $msiSource -Destination $msiTarget -Force

  $manifest = [ordered]@{
    product = "AURA AI IDE"
    version = $version
    createdAt = (Get-Date).ToString("s")
    files = @(
      @{
        type = "nsis"
        path = $nsisTarget
      },
      @{
        type = "msi"
        path = $msiTarget
      }
    )
  }

  $manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

  Write-Host "[AURA] Versioned installers saved:"
  Write-Host " - $nsisTarget"
  Write-Host " - $msiTarget"
  Write-Host " - $manifestPath"
} finally {
  Pop-Location
}
