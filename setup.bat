@echo off
echo ================================
echo  INSTALACION BACKEND LACTEOS
echo ================================
echo.

cd /d "%~dp0"

echo 1. Instalando dependencias de Node.js...
npm install

echo.
echo 2. Verificando conexion a SQL Server...
node -e "const db = require('./config/database'); db.connectDB().then(() => console.log('✅ Conexion exitosa')).catch(err => console.error('❌ Error:', err.message));"

echo.
echo 3. Configuracion completada!
echo.
echo Para iniciar el servidor ejecuta:
echo   npm start
echo.
echo Para desarrollo con auto-reload:
echo   npm run dev
echo.
echo El servidor estara disponible en: http://localhost:8080
echo.
pause