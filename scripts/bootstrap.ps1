$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  $expectedUpstream = 'https://github.com/streetpea/chiaki-ng.git'
  $upstream = git remote get-url upstream 2>$null
  if ($LASTEXITCODE -ne 0) {
    git remote add upstream $expectedUpstream
    git remote set-url --push upstream DISABLED
  } elseif ($upstream -ne $expectedUpstream) {
    throw "Unexpected upstream remote: $upstream"
  }
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is required; install the version from .tool-versions.' }
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is required.' }
  node scripts/verify-toolchain.mjs
  if ($LASTEXITCODE -ne 0) { throw 'toolchain verification failed' }
  npm ci --ignore-scripts
  if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' }
  npm run check
  if ($LASTEXITCODE -ne 0) { throw 'repository verification failed' }
  cmake --preset test
  cmake --build --preset test
  ctest --preset test
  cmake --preset production
  cmake --build --preset production
} finally {
  Pop-Location
}
