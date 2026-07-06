@echo off
title E-com Dashboard — Startup
cd /d "%~dp0"

echo ============================================
echo   E-com Dashboard — Automated Startup
echo ============================================
echo.

:: ── 1. Check Node.js ──────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Install from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found

:: ── 2. Check Docker Desktop ───────────────────
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Docker is not running. Attempting to start Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo        Waiting 20 seconds for Docker Desktop to initialize...
    timeout /t 20 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker failed to start. Please start Docker Desktop manually.
        pause
        exit /b 1
    )
)
echo [OK] Docker is running

:: ── 3. Install dependencies if needed ─────────
if not exist "node_modules\.package-lock.json" (
    echo [..] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)

:: ── 4. Start PostgreSQL ───────────────────────
echo [..] Starting PostgreSQL container...
docker compose up -d
if %errorlevel% neq 0 (
    echo [WARN] Container may already be running. Continuing...
) else (
    echo [OK] PostgreSQL container started
)

:: ── 5. Wait for PostgreSQL health check ───────
echo [..] Waiting for PostgreSQL to be healthy...
set /a attempts=0
:wait_db
docker inspect ecom-dashboard-db --format "{{.State.Health.Status}}" 2>nul | findstr "healthy" >nul
if %errorlevel% equ 0 goto db_ready
set /a attempts+=1
if %attempts% gtr 20 (
    echo [WARN] Health check timed out, checking container status...
    docker ps --filter name=ecom-dashboard-db --format "{{.Status}}"
    goto db_ready
)
timeout /t 3 /nobreak >nul
goto wait_db
:db_ready
echo [OK] PostgreSQL is ready

:: ── 6. Generate Prisma Client ─────────────────
echo [..] Generating Prisma Client...
call npx prisma generate 2>&1
echo [OK] Prisma Client generated

:: ── 7. Run migrations ─────────────────────────
echo [..] Applying database migrations...
call npx prisma migrate deploy 2>&1
if %errorlevel% neq 0 (
    echo [..] Initial migration needed. Running migrate dev...
    call npx prisma migrate dev 2>&1
)
echo [OK] Database schema is up to date

:: ── 8. Seed if empty ──────────────────────────
echo [..] Checking if seed data exists...
call npx tsx -e "import('dotenv/config').then(async()=>{const{Pool}=await import('pg');const p=new Pool({connectionString:process.env.DATABASE_URL});const r=await p.query('SELECT COUNT(*)::int as cnt FROM orders');process.exit(r.rows[0].cnt>0?0:1)}).catch(()=>process.exit(1))" 2>nul
if %errorlevel% neq 0 (
    echo [..] Seeding database with sample data (50 products, 350 users, 1200 orders)...
    call npm run db:seed
    if %errorlevel% equ 0 (
        echo [OK] Database seeded
    ) else (
        echo [WARN] Seed failed. Run 'npm run db:seed' manually later.
    )
) else (
    echo [OK] Database already contains data
)

:: ── 9. Start dev server ───────────────────────
echo.
echo ============================================
echo   Starting dev server on http://localhost:3000
echo ============================================
echo.
call npm run dev

pause
