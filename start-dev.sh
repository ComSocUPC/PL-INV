#!/bin/bash

# Script para desarrollo local - Ejecutar todos los servicios

echo "🚀 Iniciando servicios del sistema de inventario..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor, inicia Docker primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Copiando archivo de configuración..."
    cp .env.example .env
    echo "⚠️  Por favor, revisa y actualiza las variables en .env antes de continuar."
    echo "   Presiona Enter para continuar o Ctrl+C para salir..."
    read
fi

# Construir e iniciar servicios
echo "🔨 Construyendo e iniciando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

# Mostrar logs de health checks
echo "📊 Estado de salud de los servicios:"
echo ""

services=("api-gateway" "auth-service" "product-service" "inventory-service" "iot-gateway")

for service in "${services[@]}"; do
    echo "Verificando $service..."
    curl -s http://localhost:3000/health > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ $service está funcionando"
    else
        echo "❌ $service no responde"
    fi
done

echo ""
echo "🎉 Sistema iniciado!"
echo ""
echo "📍 URLs disponibles:"
echo "   API Gateway: http://localhost:3000"
echo "   Frontend: http://localhost:3005"
echo "   MQTT Broker: mqtt://localhost:1883"
echo "   WebSocket: ws://localhost:3004"
echo ""
echo "📖 Documentación de APIs:"
echo "   Auth Service: http://localhost:3001/api"
echo "   Product Service: http://localhost:3002/api"
echo "   Inventory Service: http://localhost:3003/api"
echo "   IoT Gateway: http://localhost:3004/api"
echo ""
echo "🛠️ Para ver logs: docker-compose logs -f [service-name]"
echo "🛑 Para detener: docker-compose down"
