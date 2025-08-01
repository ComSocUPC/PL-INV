# Script de PowerShell para desarrollo local - Ejecutar todos los servicios

Write-Host "🚀 Iniciando servicios del sistema de inventario..." -ForegroundColor Green

# Verificar que Docker esté corriendo
try {
    docker info | Out-Null
}
catch {
    Write-Host "❌ Docker no está corriendo. Por favor, inicia Docker primero." -ForegroundColor Red
    exit 1
}

# Crear archivo .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "📝 Copiando archivo de configuración..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Por favor, revisa y actualiza las variables en .env antes de continuar." -ForegroundColor Yellow
    Write-Host "   Presiona Enter para continuar o Ctrl+C para salir..."
    Read-Host
}

# Construir e iniciar servicios
Write-Host "🔨 Construyendo e iniciando servicios..." -ForegroundColor Blue
docker-compose up --build -d

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar estado de los servicios
Write-Host "🔍 Verificando estado de los servicios..." -ForegroundColor Blue
docker-compose ps

# Mostrar logs de health checks
Write-Host "📊 Estado de salud de los servicios:" -ForegroundColor Cyan
Write-Host ""

$services = @("api-gateway", "auth-service", "product-service", "inventory-service", "iot-gateway")

foreach ($service in $services) {
    Write-Host "Verificando $service..." -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $service está funcionando" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ $service no responde" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Sistema iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3005" -ForegroundColor White
Write-Host "   MQTT Broker: mqtt://localhost:1883" -ForegroundColor White
Write-Host "   WebSocket: ws://localhost:3004" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentación de APIs:" -ForegroundColor Cyan
Write-Host "   Auth Service: http://localhost:3001/api" -ForegroundColor White
Write-Host "   Product Service: http://localhost:3002/api" -ForegroundColor White
Write-Host "   Inventory Service: http://localhost:3003/api" -ForegroundColor White
Write-Host "   IoT Gateway: http://localhost:3004/api" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ Para ver logs: docker-compose logs -f [service-name]" -ForegroundColor Yellow
Write-Host "🛑 Para detener: docker-compose down" -ForegroundColor Yellow
