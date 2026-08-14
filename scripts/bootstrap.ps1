$ErrorActionPreference = 'Stop'

function Invoke-NativeStep {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command failed with exit code $LASTEXITCODE"
  }
}

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
  Invoke-NativeStep -Command cmake -Arguments @('--preset', 'test')
  Invoke-NativeStep -Command cmake -Arguments @('--build', '--preset', 'test', '--config', 'Debug')
  Invoke-NativeStep -Command ctest -Arguments @('--preset', 'test', '-C', 'Debug')
  Invoke-NativeStep -Command cmake -Arguments @('--preset', 'production')
  Invoke-NativeStep -Command cmake -Arguments @('--build', '--preset', 'production', '--config', 'Release')
} finally {
  Pop-Location
}
