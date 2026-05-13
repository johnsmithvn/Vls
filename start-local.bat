@echo off
echo ==========================================
echo    KHOI DONG SIGN LANGUAGE OS (LOCAL)
echo ==========================================

echo.
echo [1/5] Kiem tra file moi truong (.env) va thu vien...
if not exist "apps\api\.env" (
    echo Chua co file .env trong apps\api, dang copy tu .env.example...
    copy ".env.example" "apps\api\.env" >nul
) else (
    echo File .env da ton tai.
)

if not exist "node_modules" (
    echo Dang cai dat cac thu vien can thiet bang lenh pnpm install...
    call pnpm install
)

echo.
echo [2/5] Khoi dong Database (PostgreSQL va Redis qua Docker)...
call pnpm run infra:up
if %errorlevel% neq 0 (
    echo [LOI] Khong the khoi dong Docker. Vui long dam bao Docker Desktop dang chay.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/5] Doi Database khoi dong va nap du lieu mau (Seed Data)...
ping 127.0.0.1 -n 4 > nul
cd apps\api
echo - Chay Migration (Cap nhat cau truc bang)...
call poetry run alembic upgrade head
echo - Chay Seed (Nap chu cai va tu vung mau)...
call poetry run python scripts\seed.py
cd ..\..

echo.
echo [4/5] Khoi dong Backend API (Port 8000)...
start "SignOS - Backend API" cmd /k "pnpm run dev:api"

echo.
echo [5/5] Khoi dong Frontend Web (Port 3000)...
start "SignOS - Frontend Web" cmd /k "pnpm run dev:web"

echo.
echo ==========================================
echo HOAN TAT! HE THONG DANG CHAY:
echo - Frontend:        http://localhost:3000
echo - API Docs:        http://localhost:8000/api/docs
echo.
echo LUU Y: 
echo - Co 2 cua so den (Terminal) moi vua hien len, hay cu de chung chay.
echo - Khi muon TAT he thong: Dong 2 cua so den do lai, roi go: pnpm run infra:down
echo ==========================================
pause
