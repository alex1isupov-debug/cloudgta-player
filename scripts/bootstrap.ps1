$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is required; install the version from .tool-versions.' }
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is required.' }
  npm ci --ignore-scripts
  if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
  npm run check
  if ($LASTEXITCODE -ne 0) { throw 'repository verification failed' }
  if (Get-Command cmake -ErrorAction SilentlyContinue) {
    cmake --preset test
    cmake --build --preset test
    ctest --preset test
    cmake --preset production
    cmake --build --preset production
  } else {
    Write-Warning 'CMake is not installed locally; metadata gates passed, native build requires the pinned CMake/compiler toolchain.'
  }
} finally {
  Pop-Location
}

