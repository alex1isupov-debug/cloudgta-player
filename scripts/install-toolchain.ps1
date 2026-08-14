[CmdletBinding()]
param(
  [switch]$Describe,
  [string]$ToolchainRoot = $env:CLOUDGTA_TOOLCHAIN_ROOT
)

$ErrorActionPreference = 'Stop'
$repository = Split-Path -Parent $PSScriptRoot
if (-not $ToolchainRoot) { $ToolchainRoot = Join-Path $repository '.toolchains' }
$lock = Get-Content -Raw -LiteralPath (Join-Path $repository 'toolchains.lock.json') | ConvertFrom-Json

if ($Describe) {
  [ordered]@{
    versions = [ordered]@{
      node = $lock.node
      cmake = $lock.cmake
      qt = $lock.qt
      wix = $lock.wix
      dotnet = $lock.dotnet
      msvc = $lock.msvcTools
      windowsSdk = $lock.windowsSdk
    }
    mutatesSystem = $false
  } | ConvertTo-Json -Compress
  exit 0
}

if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) { throw 'Player bootstrap requires Windows x64.' }

function Get-LockedFile {
  param([pscustomobject]$Artifact, [string]$Destination)
  if (-not (Test-Path -LiteralPath $Destination)) {
    $urls = if ($Artifact.urls) { @($Artifact.urls) } else { @($Artifact.url) }
    $downloaded = $false
    foreach ($url in $urls) {
      try {
        Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $Destination -TimeoutSec 600
        $downloaded = $true
        break
      } catch {
        if (Test-Path -LiteralPath $Destination) { Remove-Item -LiteralPath $Destination -Force }
      }
    }
    if (-not $downloaded) { throw "Unable to download $Destination from locked sources" }
  }
  if ($Artifact.sha512) {
    $actual = (Get-FileHash -Algorithm SHA512 -LiteralPath $Destination).Hash.ToLowerInvariant()
    if ($actual -ne $Artifact.sha512) { throw "SHA-512 mismatch for $Destination" }
  } else {
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $Destination).Hash.ToLowerInvariant()
    if ($actual -ne $Artifact.sha256) { throw "SHA-256 mismatch for $Destination" }
  }
}

function Assert-ExitCode {
  param([Diagnostics.Process]$Process, [string]$Name, [int[]]$Allowed = @(0))
  if ($Process.ExitCode -notin $Allowed) { throw "$Name failed with exit code $($Process.ExitCode)" }
}

New-Item -ItemType Directory -Force -Path $ToolchainRoot | Out-Null
$downloads = Join-Path $ToolchainRoot 'downloads'
New-Item -ItemType Directory -Force -Path $downloads | Out-Null

$nodeDirectory = Join-Path $ToolchainRoot "node-v$($lock.node)-win-x64"
if (-not (Test-Path -LiteralPath (Join-Path $nodeDirectory 'node.exe'))) {
  $archive = Join-Path $downloads "node-v$($lock.node)-win-x64.zip"
  Get-LockedFile $lock.bootstrap.nodeWindowsX64 $archive
  Expand-Archive -LiteralPath $archive -DestinationPath $ToolchainRoot -Force
}

$cmakeDirectory = Join-Path $ToolchainRoot "cmake-$($lock.cmake)-windows-x86_64"
if (-not (Test-Path -LiteralPath (Join-Path $cmakeDirectory 'bin\cmake.exe'))) {
  $archive = Join-Path $downloads "cmake-$($lock.cmake)-windows-x86_64.zip"
  Get-LockedFile $lock.bootstrap.cmakeWindowsX64 $archive
  Expand-Archive -LiteralPath $archive -DestinationPath $ToolchainRoot -Force
}

$vs = $lock.bootstrap.visualStudioBuildTools
$msvcRoot = Join-Path $vs.installPath 'VC\Tools\MSVC'
$sdkRoot = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits\10\Include'
$hasMsvc = @(Get-ChildItem -LiteralPath $msvcRoot -Directory -ErrorAction SilentlyContinue | Where-Object Name -Like "$($lock.msvcTools).*").Count -gt 0
$hasSdk = Test-Path -LiteralPath (Join-Path $sdkRoot $lock.windowsSdk)
if (-not $hasMsvc -or -not $hasSdk) {
  $installer = Join-Path $downloads 'vs_buildtools.exe'
  Get-LockedFile $vs $installer
  $signature = Get-AuthenticodeSignature -LiteralPath $installer
  if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch $vs.signer) {
    throw 'Visual Studio Build Tools signature validation failed.'
  }
  $componentArguments = ($vs.components | ForEach-Object { "--add $_" }) -join ' '
  $arguments = "--quiet --wait --norestart --nocache --installPath `"$($vs.installPath)`" $componentArguments"
  $process = Start-Process -WindowStyle Hidden -FilePath $installer -ArgumentList $arguments -Wait -PassThru
  Assert-ExitCode $process 'Visual Studio Build Tools installer' @(0, 3010)
}

$qtRoot = Join-Path $ToolchainRoot 'Qt'
$qtBin = Join-Path $qtRoot "$($lock.qt)\msvc2022_64\bin"
$qtMarker = Join-Path (Split-Path -Parent $qtBin) '.cloudgta-complete'
if (-not (Test-Path -LiteralPath $qtMarker)) {
  $qtInstall = Split-Path -Parent $qtBin
  New-Item -ItemType Directory -Force -Path $qtInstall | Out-Null
  $qtDownloads = Join-Path $downloads "qt-$($lock.qt)"
  New-Item -ItemType Directory -Force -Path $qtDownloads | Out-Null
  foreach ($archive in $lock.bootstrap.qtWindowsX64.archives) {
    $path = Join-Path $qtDownloads $archive.name
    $urls = @($lock.bootstrap.qtWindowsX64.mirrors | ForEach-Object { "$($_.TrimEnd('/'))/$($lock.bootstrap.qtWindowsX64.repositoryPath)/$($archive.name)" })
    Get-LockedFile ([pscustomobject]@{ urls = $urls; sha256 = $archive.sha256 }) $path
    & tar -xf $path -C $qtInstall
    if ($LASTEXITCODE -ne 0) { throw "Unable to extract Qt archive $($archive.name)" }
  }
  $actualQt = & (Join-Path $qtBin 'qtpaths6.exe') --qt-version
  if ($LASTEXITCODE -ne 0 -or $actualQt.Trim() -ne $lock.qt) { throw "Qt $($lock.qt) verification failed after extraction" }
  Set-Content -LiteralPath $qtMarker -Value "$($lock.qt)`n" -NoNewline
}

$dotnetDirectory = Join-Path $ToolchainRoot "dotnet-sdk-$($lock.dotnet)-win-x64"
if (-not (Test-Path -LiteralPath (Join-Path $dotnetDirectory 'dotnet.exe'))) {
  $archive = Join-Path $downloads "dotnet-sdk-$($lock.dotnet)-win-x64.zip"
  Get-LockedFile $lock.bootstrap.dotnetWindowsX64 $archive
  New-Item -ItemType Directory -Force -Path $dotnetDirectory | Out-Null
  Expand-Archive -LiteralPath $archive -DestinationPath $dotnetDirectory -Force
}

$wixDirectory = Join-Path $ToolchainRoot "wix-$($lock.wix)"
$wix = Join-Path $wixDirectory 'tools\net6.0\any\wix.exe'
if (-not (Test-Path -LiteralPath $wix)) {
  $archive = Join-Path $downloads "wix-$($lock.wix)-artifacts.zip"
  Get-LockedFile $lock.bootstrap.wixWindowsX64 $archive
  $package = Join-Path $downloads $lock.bootstrap.wixWindowsX64.package
  & tar -xf $archive -C $downloads $lock.bootstrap.wixWindowsX64.package
  if ($LASTEXITCODE -ne 0) { throw 'Unable to extract the locked WiX package.' }
  New-Item -ItemType Directory -Force -Path $wixDirectory | Out-Null
  & tar -xf $package -C $wixDirectory
  if ($LASTEXITCODE -ne 0) { throw 'Unable to extract the WiX CLI.' }
}

$env:DOTNET_ROOT = $dotnetDirectory
$env:Path = "$nodeDirectory;$($cmakeDirectory)\bin;$qtBin;$(Split-Path -Parent $wix);$dotnetDirectory;$env:Path"
Write-Output "toolchain installed: Node $($lock.node), CMake $($lock.cmake), Qt $($lock.qt), WiX $($lock.wix), .NET $($lock.dotnet), MSVC tools $($lock.msvcTools), SDK $($lock.windowsSdk)"
