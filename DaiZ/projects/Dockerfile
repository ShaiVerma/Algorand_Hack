# 1. Base image with Node.js + Python
FROM node:20-bullseye AS base

# Install Python + Pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

WORKDIR /app

# ----------------------------
# 2. Backend setup (Python API)
# ----------------------------
COPY DaiZ-contracts/api/ ./api/
COPY DaiZ-contracts/requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# ----------------------------
# 3. Frontend setup (React)
# ----------------------------
COPY DaiZ-frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# ----------------------------
# 4. Final stage: serve frontend + backend
# ----------------------------
WORKDIR /app
COPY DaiZ-contracts/api/ ./api/
COPY DaiZ-frontend/build/ ./frontend/build/

# Expose ports
EXPOSE 3000  # frontend
EXPOSE 8000  # backend

# Start both services
CMD [ "sh", "-c", "uvicorn api.main:app --host 0.0.0.0 --port 8000 & npx serve -s frontend/build -l 3000" ]
