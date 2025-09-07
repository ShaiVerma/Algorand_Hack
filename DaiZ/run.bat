@echo off
REM -----------------------------
REM Run DaiZ Project - Windows
REM -----------------------------

REM Activate Conda environment
call conda activate algorand

REM Go to projects directory
cd projects

REM -----------------------------
REM Step 1: Compile the smart contract
REM -----------------------------
echo Compiling smart contract...
cd DaiZ-contracts
algokit compile py contract.py
if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    exit /b %ERRORLEVEL%
)

REM -----------------------------
REM Step 1b: Compile without output teal
REM -----------------------------
echo Compiling smart contract (no teal output)...
algokit compile py contract.py --no-output-teal
if %ERRORLEVEL% NEQ 0 (
    echo Compilation (no teal) failed!
    exit /b %ERRORLEVEL%
)

REM -----------------------------
REM Step 1c: Generate Python client
REM -----------------------------
echo Generating Python client...
algokit generate client DecentralizedAiContract.arc56 --output client.py
if %ERRORLEVEL% NEQ 0 (
    echo Client generation failed!
    exit /b %ERRORLEVEL%
)

REM -----------------------------
REM Step 2: Build and deploy the project
REM -----------------------------
cd ..
echo Building and deploying project...
algokit project run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    exit /b %ERRORLEVEL%
)
algokit project deploy
if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed!
    exit /b %ERRORLEVEL%
)

REM -----------------------------
REM Step 3: Run the Python backend API
REM -----------------------------
echo Starting backend API...
start cmd /k "uvicorn DaiZ-backend.api:app --reload --port 4000"

REM -----------------------------
REM Step 4: Install and run frontend
REM -----------------------------
echo Starting frontend...
cd DaiZ-frontend
npm install
npm run dev

echo -----------------------------
echo All services started successfully!
