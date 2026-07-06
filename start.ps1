<#
.SYNOPSIS
    E-com Dashboard — Automated Startup
.DESCRIPTION
    Starts Docker PostgreSQL, runs migrations, seeds if needed, and launches the dev server.
.EXAMPLE
    .\start.ps1
#>

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

function Write-Step($message) { Write-Host "`n━━━ $message ━━━" -ForegroundColor Cyan }
function Write-OK($message) { Write-Host "  [✓] $message" -ForegroundColor Green }
function Write-Warn($message) { Write-Host "  [!] $message" -ForegroundColor Yellow }
function Fatal($message) { Write-Host "  [✗] $message" -ForegroundColor Red; exit 1 }

# ── Header ────────────────────────────────────────────────────
Clear-Host
Write-Host @"

╔══════════════════════════════════════════════════╗
║        E-com Dashboard — Automated Startup       ║
║            Docker → Migrate → Seed → Dev          ║
╚══════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# ── 1. Prerequisites ─────────────────────────────────────────
Write-Step "1/7  Checking prerequisites"

# Node.js
try {
    $nodeVer = node --version
    Write-OK "Node.js $nodeVer"
} catch {
    Fatal "Node.js is not installed. Install from https://nodejs.org/"
}

# Docker Desktop
$dockerRunning = $false
try {
    $info = docker info --format "{{.OperatingSystem}}" 2>$null
    if ($info) { $dockerRunning = $true }
} catch {}

if (-not $dockerRunning) {
    Write-Warn "Docker Desktop is not running. Launching..."
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "         Waiting 25 seconds for Docker to initialize..."
        Start-Sleep -Seconds 25
        try {
            $null = docker info --format "{{.OperatingSystem}}" 2>$null
            Write-OK "Docker Desktop started"
        } catch {
            Fatal "Docker failed to start. Please launch Docker Desktop manually."
        }
    } else {
        Fatal "Docker Desktop not found at $dockerPath. Please install from https://docker.com"
    }
} else {
    Write-OK "Docker Desktop is running"
}

# ── 2. Install dependencies ──────────────────────────────────
Write-Step "2/7  Installing dependencies"
if (-not (Test-Path "node_modules\.package-lock.json")) {
    npm install --silent 2>$null
    if ($LASTEXITCODE -ne 0) { Fatal "npm install failed" }
    Write-OK "Dependencies installed"
} else {
    Write-OK "Dependencies already installed"
}

# ── 3. Start PostgreSQL ──────────────────────────────────────
Write-Step "3/7  Starting PostgreSQL"
docker compose up -d 2>$null
Start-Sleep -Seconds 3

# Wait for health check
$healthy = $false
for ($i = 1; $i -le 20; $i++) {
    $status = docker inspect ecom-dashboard-db --format "{{.State.Health.Status}}" 2>$null
    if ($status -eq "healthy") { $healthy = $true; break }
    Write-Host "         Waiting for PostgreSQL... ($i/20)" -NoNewline
    Start-Sleep -Seconds 3
    Write-Host "`r" -NoNewline
}
if (-not $healthy) {
    Write-Warn "Health check timed out, checking container status..."
    $status = docker inspect ecom-dashboard-db --format "{{.State.Status}}" 2>$null
    if ($status -ne "running") {
        docker logs ecom-dashboard-db --tail 20
        Fatal "PostgreSQL container is not running (status: $status)"
    }
}
Write-OK "PostgreSQL is running"

# ── 4. Generate Prisma Client ─────────────────────────────────
Write-Step "4/7  Generating Prisma Client"
npx prisma generate 2>$null
Write-OK "Prisma Client generated"

# ── 5. Run migrations ─────────────────────────────────────────
Write-Step "5/7  Applying database migrations"
$migrateOutput = npx prisma migrate deploy 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Initial migration needed, running migrate dev..."
    npx prisma migrate dev 2>&1
    if ($LASTEXITCODE -ne 0) { Fatal "Database sync failed" }
}
Write-OK "Database schema is up to date"

# ── 6. Seed database ──────────────────────────────────────────
Write-Step "6/7  Seeding sample data"
$hasData = $false
try {
    $result = npx tsx -e @"
import('dotenv/config').then(async () => {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const r = await pool.query('SELECT COUNT(*)::int as cnt FROM orders');
  process.exit(r.rows[0].cnt > 0 ? 0 : 1);
}).catch(() => process.exit(1));
"@ 2>$null
    if ($LASTEXITCODE -eq 0) { $hasData = $true }
} catch {}

if ($hasData) {
    Write-OK "Database already contains seed data"
} else {
    Write-Host "         Seeding with 50 products, 350 users, 1,200 orders..."
    npm run db:seed
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "Seed did not complete. Run 'npm run db:seed' manually."
    } else {
        Write-OK "Database seeded successfully"
    }
}

# ── 7. Start dev server ───────────────────────────────────────
Write-Step "7/7  Starting development server"
Write-Host @"

╔══════════════════════════════════════════════════╗
║   Dashboard starting at http://localhost:3000    ║
║                                                  ║
║   Press Ctrl+C to stop the server                ║
╚══════════════════════════════════════════════════╝

"@ -ForegroundColor Green

npm run dev
