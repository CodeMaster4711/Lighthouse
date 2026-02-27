#!/bin/sh

echo "Waiting for SurrealDB to be ready..."
sleep 5

echo "Starting Vite dev server..."
npm run dev -- --host 0.0.0.0
