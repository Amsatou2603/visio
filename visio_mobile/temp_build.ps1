Set-Location 'C:\Users\ndiay\Desktop\visio\visio_mobile'
$env:JAVA_HOME='C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot'
# Prepend java bin to PATH for this process (avoid complex concatenation issues)
$env:PATH = "$($env:JAVA_HOME)\\bin;$($env:PATH)"
Write-Output "JAVA_HOME=$env:JAVA_HOME"
Write-Output "PATH starts with: $($env:PATH.Substring(0,[Math]::Min(80,$env:PATH.Length)))"
& "$env:JAVA_HOME\bin\java" -version

# Remove malformed NDK to force AGP to re-download it
$ndkPath = 'C:\Users\ndiay\AppData\Local\Android\sdk\ndk\28.2.13676358'
if (Test-Path $ndkPath) {
	Write-Output "Removing malformed NDK at $ndkPath"
	Remove-Item -LiteralPath $ndkPath -Recurse -Force -ErrorAction SilentlyContinue
} else {
	Write-Output "NDK folder not present: $ndkPath"
}

Write-Output "Running flutter clean"
flutter clean
Write-Output "Running flutter pub get"
flutter pub get

Write-Output "Starting flutter build (verbose). Logs will be saved to build\\flutter_build_output.txt"
# Ensure build directory exists
New-Item -ItemType Directory -Force -Path build | Out-Null
flutter build apk --release -v *>&1 | Tee-Object -FilePath 'build\\flutter_build_output.txt'
