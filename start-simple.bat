@echo off
title E-com Dashboard
cd /d "%~dp0"

echo ===== Starting E-com Dashboard =====
echo.

:: 1. Install dependencies (if needed)
call npm install

:: 2. Start PostgreSQL
docker compose up -d
echo Waiting for PostgreSQL...
timeout /t 15 /nobreak >nul

:: 3. Generate Prisma Client
call npx prisma generate

:: 4. Apply migrations
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    call npx prisma migrate dev
)

:: 5. Seed database
call npm run db:seed

:: 6. Start dev server
echo.
echo ===== Starting on http://localhost:3000 =====
echo.
call npm run dev

pause
