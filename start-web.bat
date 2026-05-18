@echo off
setlocal
title ProxyListChecker web UI

cd /d "%~dp0web"

where pnpm >nul 2>nul
if errorlevel 1 (
    echo [!] pnpm is not installed.
    where node >nul 2>nul
    if errorlevel 1 (
        echo [!] Node.js is also missing. Install from https://nodejs.org/
        pause
        exit /b 1
    )
    echo Installing pnpm globally...
    call npm install -g pnpm
    if errorlevel 1 ( echo Failed to install pnpm. & pause & exit /b 1 )
)

if not exist "node_modules\.modules.yaml" (
    echo Installing dependencies, please wait...
    call pnpm install
    if errorlevel 1 ( echo pnpm install failed. & pause & exit /b 1 )
)

set "PORT=5174"
echo.
echo === ProxyListChecker web UI ===
echo Opening http://127.0.0.1:%PORT% in your browser shortly...
echo Press Ctrl+C in this window to stop the dev server.
echo.

start "" /b cmd /c "timeout /t 4 /nobreak >nul && start http://127.0.0.1:%PORT%/"

call pnpm exec vite --host 127.0.0.1 --port %PORT%
