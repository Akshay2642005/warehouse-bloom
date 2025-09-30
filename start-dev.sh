#!/bin/bash

echo "Starting Warehouse Management System..."

echo ""
echo "Starting Redis..."
docker run -d --name warehouse_redis -p 6379:6379 redis:7-alpine 2>/dev/null || echo "Redis already running or Docker not available"

echo ""
echo "Starting PostgreSQL..."
docker run -d --name warehouse_postgres -p 5432:5432 -e POSTGRES_DB=warehouse_bloom -e POSTGRES_USER=warehouse_user -e POSTGRES_PASSWORD=warehouse_pass postgres:15-alpine 2>/dev/null || echo "PostgreSQL already running or Docker not available"

echo ""
echo "Waiting for services to start..."
sleep 3

echo ""
echo "Starting backend server..."
cd server && npm run dev &
SERVER_PID=$!

echo ""
echo "Starting frontend client..."
cd ../client && npm run dev &
CLIENT_PID=$!

echo ""
echo "All services started!"
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
trap 'echo ""; echo "Stopping services..."; kill $SERVER_PID $CLIENT_PID 2>/dev/null; docker stop warehouse_redis warehouse_postgres 2>/dev/null; docker rm warehouse_redis warehouse_postgres 2>/dev/null; echo "Services stopped."; exit' INT

wait