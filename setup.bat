@echo off
title Tree Plantation Platform - Setup
color 0A
cls

echo.
echo  ================================================
echo   TREE PLANTATION PLATFORM - AUTO SETUP
echo  ================================================
echo.

:MENU
echo  Choose your database option:
echo.
echo  [1] I have PostgreSQL installed locally
echo  [2] I want to use Neon.tech (FREE cloud database)
echo  [3] I already have a DATABASE_URL, just create .env
echo.
set /p choice="Enter your choice (1, 2 or 3): "

if "%choice%"=="1" goto LOCAL_PG
if "%choice%"=="2" goto NEON
if "%choice%"=="3" goto MANUAL
echo Invalid choice. Try again.
goto MENU

:LOCAL_PG
cls
echo.
echo  === LOCAL POSTGRESQL SETUP ===
echo.
echo  Make sure PostgreSQL is running on your machine.
echo.
set /p pgpass="Enter your PostgreSQL password (default user: postgres): "
set /p dbname="Enter database name (press Enter for: tree_platform): "
if "%dbname%"=="" set dbname=tree_platform

echo.
echo  Creating database "%dbname%"...
psql -U postgres -c "CREATE DATABASE %dbname%;" 2>nul
if errorlevel 1 (
  echo  [WARN] Could not auto-create database. You may need to create it manually.
  echo  Run in psql:  CREATE DATABASE %dbname%;
)

set DB_URL=postgresql://postgres:%pgpass%@localhost:5432/%dbname%
goto CREATE_ENV

:NEON
cls
echo.
echo  === NEON.TECH FREE CLOUD DATABASE ===
echo.
echo  1. Open your browser and go to: https://neon.tech
echo  2. Sign up for FREE (no credit card needed)
echo  3. Create a new Project
echo  4. Copy the connection string shown (starts with postgresql://...)
echo.
set /p DB_URL="Paste your Neon connection string here: "
goto CREATE_ENV

:MANUAL
cls
echo.
echo  === MANUAL DATABASE URL ===
echo.
set /p DB_URL="Paste your full DATABASE_URL here: "
goto CREATE_ENV

:CREATE_ENV
echo.
echo  Creating .env file...

(
echo DATABASE_URL="%DB_URL%"
echo NEXTAUTH_SECRET="treeplantationdriveplatformsecretkey2024xyz"
echo NEXTAUTH_URL="http://localhost:3000"
echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
echo NEXT_PUBLIC_APP_NAME="Tree Plantation Drive"
echo RAZORPAY_KEY_ID="rzp_test_placeholder"
echo RAZORPAY_KEY_SECRET="placeholder_secret"
echo NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_placeholder"
echo SENDGRID_API_KEY=""
echo FROM_EMAIL="noreply@treeplantation.org"
echo FROM_NAME="Tree Plantation Drive"
echo ADMIN_EMAIL="admin@treeplantation.org"
) > .env

echo  [OK] .env file created!
echo.
echo  Running database setup...
echo.

echo  Step 1: Generating Prisma client...
call npx prisma generate
if errorlevel 1 goto ERROR

echo.
echo  Step 2: Running migrations...
call npx prisma migrate dev --name init
if errorlevel 1 goto ERROR

echo.
echo  Step 3: Seeding database...
call npx ts-node --project tsconfig.json prisma/seed.ts
if errorlevel 1 goto ERROR

echo.
echo  ================================================
echo   SUCCESS! Database is ready.
echo  ================================================
echo.
echo   Default Admin Login:
echo   Email:    admin@treeplantation.org
echo   Password: admin@123
echo.
echo   Starting development server...
echo   Open http://localhost:3000 in your browser
echo.
pause
call npm run dev
goto END

:ERROR
echo.
echo  ================================================
echo   SOMETHING WENT WRONG
echo  ================================================
echo.
echo  Common fixes:
echo  - Make sure your DATABASE_URL is correct
echo  - For local PG: check PostgreSQL is running
echo  - For Neon: make sure you copied the full URL
echo.
echo  Your .env file has been saved. Fix the DATABASE_URL
echo  and then run these commands manually:
echo    npx prisma generate
echo    npx prisma migrate dev --name init
echo    npx ts-node --project tsconfig.json prisma/seed.ts
echo    npm run dev
echo.
pause

:END
