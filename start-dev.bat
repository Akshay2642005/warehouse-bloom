@echo off
echo Starting Warehouse Management System...

echo.
echo Starting Redis...
docker run -d --name warehouse_redis -p 6379:6379 redis:7-alpine 2>nul || echo Redis already running or Docker not available

echo.
echo Starting PostgreSQL...
docker run -d --name warehouse_postgres -p 5432:5432 -e POSTGRES_DB=warehouse_bloom -e POSTGRES_USER=warehouse_user -e POSTGRES_PASSWORD=warehouse_pass postgres:15-alpine 2>nul || echo PostgreSQL already running or Docker not available

echo.
echo Waiting for services to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting backend server...
cd server
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting frontend client...
cd ..\client
start "Frontend Client" cmd /k "npm run dev"

echo.
echo All services started! 
echo Backend: http://localhost:4000
echo Frontend: http://localhost:8080
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
docker stop warehouse_redis warehouse_postgres 2>nul
docker rm warehouse_redis warehouse_postgres 2>nul
echo Services stopped.