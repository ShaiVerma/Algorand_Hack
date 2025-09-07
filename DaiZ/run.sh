#!/bin/bash
set -e  # stop on error

# 1️⃣ Build the Algokit project
echo "Building Algokit project..."
algokit project run build

# 2️⃣ Deploy the project
echo "Deploying project..."
algokit project deploy

# 3️⃣ Start backend API
echo "Starting backend..."
uvicorn main:app --reload --port 4000
