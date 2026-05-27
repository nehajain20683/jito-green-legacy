# Tree Plantation Platform - PowerShell Setup Script
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

$host.UI.RawUI.WindowTitle = "Tree Plantation Platform Setup"
Clear-Host

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "   TREE PLANTATION PLATFORM - AUTO SETUP" -ForegroundColor Green
Write-Host "  ================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Choose your database option:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [1] I have PostgreSQL installed locally" -ForegroundColor White
Write-Host "  [2] I want to use Neon.tech (FREE cloud DB)" -ForegroundColor White
Write-Host "  [3] I already have a DATABASE_URL" -ForegroundColor White
Write-Host ""
$choice = Read-Host "  Enter choice (1, 2 or 3)"

$dbUrl = ""

switch ($choice) {
    "1" {
        Clear-Host
        Write-Host ""
        Write-Host "  === LOCAL POSTGRESQL SETUP ===" -ForegroundColor Cyan
        Write-Host ""
        $pgpass = Read-Host "  Enter PostgreSQL password (user: postgres)"
        $dbname = Read-Host "  Database name [press Enter for 'tree_platform']"
        if ($dbname -eq "") { $dbname = "tree_platform" }

        Write-Host ""
        Write-Host "  Creating database '$dbname'..." -ForegroundColor Yellow
        try {
            $env:PGPASSWORD = $pgpass
            & psql -U postgres -c "CREATE DATABASE $dbname;" 2>$null
            Write-Host "  [OK] Database created!" -ForegroundColor Green
        } catch {
            Write-Host "  [WARN] Could not auto-create. Create it manually if needed." -ForegroundColor Yellow
        }
        $dbUrl = "postgresql://postgres:$pgpass@localhost:5432/$dbname"
    }
    "2" {
        Clear-Host
        Write-Host ""
        Write-Host "  === NEON.TECH FREE CLOUD DATABASE ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Steps:" -ForegroundColor White
        Write-Host "  1. Go to https://neon.tech and sign up FREE" -ForegroundColor White
        Write-Host "  2. Create a new Project" -ForegroundColor White
        Write-Host "  3. Copy the connection string (postgresql://...)" -ForegroundColor White
        Write-Host ""
        Start-Process "https://neon.tech"
        Write-Host ""
        $dbUrl = Read-Host "  Paste your Neon connection string"
    }
    "3" {
        Write-Host ""
        $dbUrl = Read-Host "  Paste your full DATABASE_URL"
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Create .env file
Write-Host ""
Write-Host "  Creating .env file..." -ForegroundColor Yellow

$envContent = @"
DATABASE_URL="$dbUrl"
NEXTAUTH_SECRET="treeplantationdriveplatformsecretkey2024xyz"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Tree Plantation Drive"
RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="placeholder_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_placeholder"
SENDGRID_API_KEY=""
FROM_EMAIL="noreply@treeplantation.org"
FROM_NAME="Tree Plantation Drive"
ADMIN_EMAIL="admin@treeplantation.org"
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "  [OK] .env created!" -ForegroundColor Green

# Run setup steps
Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "  Running database setup..." -ForegroundColor Green
Write-Host "  ================================================" -ForegroundColor Green

Write-Host ""
Write-Host "  [1/3] Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "  ERROR in prisma generate" -ForegroundColor Red; Read-Host; exit 1 }

Write-Host ""
Write-Host "  [2/3] Running migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) { Write-Host "  ERROR in migrate" -ForegroundColor Red; Read-Host; exit 1 }

Write-Host ""
Write-Host "  [3/3] Seeding database..." -ForegroundColor Cyan
npx ts-node --project tsconfig.json prisma/seed.ts
if ($LASTEXITCODE -ne 0) { Write-Host "  ERROR in seed" -ForegroundColor Red; Read-Host; exit 1 }

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Green
Write-Host "   ALL DONE! Platform is ready." -ForegroundColor Green
Write-Host "  ================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Admin Login:" -ForegroundColor Cyan
Write-Host "  Email:    admin@treeplantation.org" -ForegroundColor White
Write-Host "  Password: admin@123" -ForegroundColor White
Write-Host ""
Write-Host "  Starting dev server at http://localhost:3000" -ForegroundColor Green
Write-Host ""
Read-Host "  Press Enter to start..."
npm run dev
