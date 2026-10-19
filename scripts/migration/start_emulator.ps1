# Locate Java runtime for Firebase Emulator
if (-not $env:JAVA_HOME) {
    $fallbackJava = "C:\Users\ASUS\.tools\jdk-21\zulu21.36.17-ca-jdk21.0.4-win_x64"
    if (Test-Path $fallbackJava) {
        $env:JAVA_HOME = $fallbackJava
        $env:PATH = "$fallbackJava\bin;$env:PATH"
    }
}

Write-Output "[Launcher] Process-local JAVA_HOME set to: $env:JAVA_HOME"
if ($env:JAVA_HOME) {
    & "$env:JAVA_HOME\bin\java.exe" -version
} else {
    java -version
}

Write-Output "[Launcher] Starting official Firebase Local Emulator Suite..."
& ".\backend\node_modules\.bin\firebase.cmd" emulators:start --only firestore --project iiuc-cover-page-staging
