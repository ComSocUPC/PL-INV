# 🚀 Guía de Despliegue - Sistema de Almacén

Esta guía te ayudará a desplegar el sistema completo paso a paso, tanto en desarrollo como en producción.

## 🎯 Prerrequisitos

### 📦 Software Requerido:
- **Docker** (versión 20.10+)
- **Docker Compose** (versión 2.0+)
- **Git** (para clonar el repositorio)
- **curl** (para probar APIs)

### 🔧 Verificar Instalación:
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Git
git --version

# Verificar curl
curl --version
```

### 🌐 Puertos Requeridos:
- **3000**: API Gateway
- **3001**: Auth Service
- **3002**: Product Service
- **3003**: IoT Service

```bash
# Verificar que los puertos estén libres
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :3002
netstat -tulpn | grep :3003
```

## 🚀 Despliegue Rápido (Desarrollo)

### 1️⃣ **Clonar y Navegar:**
```bash
# Si aún no tienes el proyecto
git clone <repository-url>
cd example-simple-warehouse
```

### 2️⃣ **Ejecutar Todo el Sistema:**
```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f
```

### 3️⃣ **Verificar Estado:**
```bash
# Ver estado de todos los servicios
docker-compose ps

# Verificar salud de cada servicio
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### 4️⃣ **Acceder al Sistema:**
- **API Gateway**: http://localhost:3000
- **Documentación APIs**: http://localhost:3000/api-docs
- **Auth Service**: http://localhost:3001/api-docs
- **Product Service**: http://localhost:3002/api-docs
- **IoT Service**: http://localhost:3003/api-docs

## 🔧 Despliegue por Servicios (Desarrollo)

### 🚪 **Solo API Gateway:**
```bash
# Construir y ejecutar solo API Gateway
docker-compose up -d --build api-gateway

# Ver logs específicos
docker-compose logs -f api-gateway

# Probar
curl http://localhost:3000/health
```

### 🔐 **Solo Auth Service:**
```bash
# Construir y ejecutar solo Auth Service
docker-compose up -d --build auth-service

# Probar login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

### 🛍️ **Solo Product Service:**
```bash
# Construir y ejecutar solo Product Service
docker-compose up -d --build product-service

# Probar productos
curl http://localhost:3002/api/products
```

### 🌐 **Solo IoT Service:**
```bash
# Construir y ejecutar solo IoT Service
docker-compose up -d --build iot-service

# Probar dispositivos
curl http://localhost:3003/api/devices

# Conectar WebSocket
wscat -c ws://localhost:3003/ws
```

## 🧪 Verificación Completa del Sistema

### 1️⃣ **Health Checks:**
```bash
#!/bin/bash
# Script de verificación completa

echo "🏥 Verificando salud de servicios..."

services=("api-gateway:3000" "auth-service:3001" "product-service:3002" "iot-service:3003")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    echo "Verificando $name..."
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
    
    if [ $response -eq 200 ]; then
        echo "✅ $name: OK"
    else
        echo "❌ $name: FAILED (HTTP $response)"
    fi
done
```

### 2️⃣ **Test de Flujo Completo:**
```bash
#!/bin/bash
# Test de integración completa

echo "🧪 Ejecutando tests de integración..."

# 1. Login
echo "1. Testing authentication..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}' | \
  jq -r '.data.token')

if [ "$TOKEN" != "null" ]; then
    echo "✅ Authentication: OK"
else
    echo "❌ Authentication: FAILED"
    exit 1
fi

# 2. Get Products
echo "2. Testing products..."
PRODUCTS=$(curl -s http://localhost:3000/api/products | jq '.data | length')
echo "✅ Products found: $PRODUCTS"

# 3. IoT Simulation
echo "3. Testing IoT simulation..."
NFC_RESULT=$(curl -s -X POST http://localhost:3000/api/iot/simulate/nfc \
  -H "Content-Type: application/json" \
  -d '{"device_id": "NFC-ENTRANCE-001"}' | \
  jq -r '.success')

if [ "$NFC_RESULT" = "true" ]; then
    echo "✅ IoT NFC simulation: OK"
else
    echo "❌ IoT NFC simulation: FAILED"
fi

echo "🎉 All tests completed!"
```

## 🔄 Comandos de Gestión

### **Iniciar Sistema:**
```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar con reconstrucción
docker-compose up -d --build

# Iniciar servicio específico
docker-compose up -d auth-service
```

### **Parar Sistema:**
```bash
# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v

# Parar servicio específico
docker-compose stop auth-service
```

### **Logs y Debugging:**
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de servicio específico
docker-compose logs -f product-service

# Ver logs sin seguir
docker-compose logs product-service --tail=100

# Ver logs con timestamp
docker-compose logs -f -t
```

### **Reiniciar Servicios:**
```bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar servicio específico
docker-compose restart iot-service

# Reconstruir y reiniciar
docker-compose up -d --build --force-recreate
```

### **Escalado Horizontal:**
```bash
# Escalar servicio específico
docker-compose up -d --scale product-service=3

# Ver servicios escalados
docker-compose ps
```

## 🐳 Comandos Docker Útiles

### **Gestión de Imágenes:**
```bash
# Ver imágenes construidas
docker images | grep warehouse

# Eliminar imágenes no utilizadas
docker image prune

# Reconstruir imagen específica
docker-compose build auth-service --no-cache
```

### **Gestión de Contenedores:**
```bash
# Ver contenedores en ejecución
docker ps

# Ejecutar comando en contenedor
docker exec -it warehouse-auth-service sh

# Ver estadísticas de recursos
docker stats
```

### **Gestión de Volúmenes:**
```bash
# Ver volúmenes
docker volume ls | grep warehouse

# Inspeccionar volumen
docker volume inspect warehouse-auth-data

# Limpiar volúmenes no utilizados
docker volume prune
```

### **Limpieza General:**
```bash
# Limpiar todo el sistema Docker
docker system prune -a

# Limpiar solo componentes no utilizados
docker system prune

# Limpiar con volúmenes
docker system prune -a --volumes
```

## 🌐 Despliegue en Producción

### **Variables de Entorno de Producción:**
```bash
# .env.production
NODE_ENV=production
JWT_SECRET=tu-secreto-ultra-seguro-aqui
API_RATE_LIMIT=1000
LOG_LEVEL=info
```

### **Docker Compose para Producción:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    environment:
      - NODE_ENV=production
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

### **Comandos de Producción:**
```bash
# Usar archivo de producción
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Con variables de entorno
docker-compose --env-file .env.production up -d
```

## 🔒 Configuración de Seguridad

### **JWT Secrets:**
```bash
# Generar secreto seguro
openssl rand -base64 32

# Configurar en variables de entorno
export JWT_SECRET="tu-secreto-generado-aqui"
```

### **Network Security:**
```yaml
# docker-compose.yml - Red interna
networks:
  warehouse-internal:
    driver: bridge
    internal: true  # Sin acceso a internet
  warehouse-public:
    driver: bridge  # Solo para API Gateway
```

### **Container Security:**
```dockerfile
# Dockerfile - Usuario no privilegiado
RUN adduser -D -s /bin/sh appuser
USER appuser

# Health checks
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/health || exit 1
```

## 📊 Monitoreo en Producción

### **Docker Health Monitoring:**
```bash
# Ver salud de contenedores
docker ps --format "table {{.Names}}\t{{.Status}}"

# Script de monitoreo automático
#!/bin/bash
while true; do
    docker-compose ps --services --filter "status=running" | wc -l
    sleep 30
done
```

### **Log Monitoring:**
```bash
# Configurar log rotation
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### **Resource Monitoring:**
```bash
# Ver uso de recursos
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Límites de recursos en compose
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

## 🆘 Solución de Problemas

### **Problemas Comunes:**

#### **Puerto Ocupado:**
```bash
# Encontrar proceso usando puerto
sudo lsof -i :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Puerto host diferente
```

#### **Servicios No Inician:**
```bash
# Ver logs detallados
docker-compose logs auth-service

# Verificar configuración
docker-compose config

# Verificar variables de entorno
docker-compose exec auth-service env
```

#### **Base de Datos Corrupta:**
```bash
# Eliminar volúmenes y reiniciar
docker-compose down -v
docker-compose up -d --build
```

#### **Problemas de Red:**
```bash
# Verificar red Docker
docker network ls
docker network inspect warehouse-network

# Recrear red
docker-compose down
docker network prune
docker-compose up -d
```

#### **Memoria Insuficiente:**
```bash
# Verificar uso de memoria
docker stats

# Limpiar sistema
docker system prune -a

# Aumentar límites
# En docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G
```

### **Scripts de Diagnóstico:**

#### **diagnostic.sh:**
```bash
#!/bin/bash
echo "🔍 Diagnóstico del Sistema de Almacén"
echo "=================================="

echo "📊 Docker System Info:"
docker version --format '{{.Server.Version}}'
docker-compose version --short

echo "📦 Containers Status:"
docker-compose ps

echo "🌐 Network Status:"
docker network ls | grep warehouse

echo "💾 Volume Status:"
docker volume ls | grep warehouse

echo "📈 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo "🏥 Health Checks:"
for port in 3000 3001 3002 3003; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
    echo "Port $port: $status"
done
```

---

**¡Con esta guía podrás desplegar el sistema en cualquier entorno de manera exitosa!** 🚀
