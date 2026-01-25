#!/bin/bash
export DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/zeytin?schema=public"

# Kill existing processes
pkill -f "concurrently"
pkill -f "ts-node-dev"
pkill -f "next"

# Clear Next.js cache
rm -rf frontend/.next

# Start with concurrently
npx concurrently "cd backend && npm run dev" "cd frontend && npm run dev"

