@echo off
echo ============================================
echo   DocuMind - RAG Chatbot Launcher
echo ============================================
echo.

:: Check if .env has the API key set
findstr /C:"your_gemini_api_key_here" "backend\.env" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] You have not set your Gemini API key!
    echo Open backend\.env and replace "your_gemini_api_key_here" with your key.
    echo Get a free key at: https://aistudio.google.com
    echo.
    pause
)

echo Starting Backend (Flask)...
start "RAG Backend" cmd /k "cd backend && pip install -r requirements.txt --quiet && python app.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend (React)...
start "RAG Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   Both servers are starting!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:5173
echo ============================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo Done! Check the two terminal windows.
pause
