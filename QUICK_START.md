# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a comenzar con el sistema de inventario de productos utilizando arquitectura de microservicios en menos de 10 minutos.

## 📋 Requisitos Previos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- [Node.js](https://nodejs.org/) (opcional, para desarrollo local)
- [Git](https://git-scm.com/) para control de versiones

## 🏗️ Estructura del Proyecto (Simplificada)

```
COMSOC/
├── 1-frontend/          # 🎨 CAPA DE PRESENTACIÓN
│   ├── src/            # Código React
│   ├── Dockerfile      # Container del frontend
│   └── package.json    # Dependencias de React
├── 2-backend/          # ⚙️ CAPA DE LÓGICA DE NEGOCIO
│   ├── api-gateway/    # Punto de entrada único
│   ├── auth-service/   # Autenticación y usuarios
│   ├── product-service/ # Gestión de productos
│   ├── inventory-service/ # Control de inventario
│   └── iot-service/    # Dispositivos IoT (NFC, sensores)
├── 3-database/         # 💾 CAPA DE DATOS
│   ├── postgres/       # Base de datos principal
│   ├── redis/         # Cache y sesiones
│   └── mqtt/          # Broker para IoT
└── docker-compose.yml  # Orquestación de todos los servicios
```

## 🎯 ¿De Dónde Vengo? (Arquitectura 3 Capas vs Microservicios)

Si estás acostumbrado a trabajar con **arquitectura de 3 capas tradicional**:

### Antes (3 Capas Monolíticas):
```
Frontend (React) ←→ Backend (Node.js) ←→ Database (PostgreSQL)
```

### Ahora (Microservicios):
```
Frontend (React) ←→ API Gateway ←→ [ Auth Service ]
                                 ←→ [ Product Service ]
                                 ←→ [ Inventory Service ]
                                 ←→ [ IoT Service ]
                                 ↓
                               [ PostgreSQL + Redis + MQTT ]
```

**¡La diferencia clave es que dividimos el "Backend" en múltiples servicios especializados!**

## 🏃‍♂️ Inicio Rápido en 3 Pasos

### Paso 1: Clonar y Configurar
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd COMSOC

# Crear archivo de variables de entorno
cp .env.example .env
```

### Paso 2: Levantar Todo el Sistema
```bash
# Construir y levantar todos los servicios
docker-compose up --build

# O en segundo plano
docker-compose up --build -d
```

### Paso 3: Verificar que Todo Funcione
```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Probar el API Gateway
curl http://localhost:3000/health

# Acceder al frontend
# Abrir navegador en: http://localhost:3005
```

## 🔗 URLs de Acceso

Una vez que todo esté corriendo:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3005 | Interfaz de usuario principal |
| **API Gateway** | http://localhost:3000 | Punto de entrada de la API |
| **Autenticación** | http://localhost:3001 | Servicio de usuarios |
| **Productos** | http://localhost:3002 | Gestión de productos |
| **Inventario** | http://localhost:3003 | Control de stock |
| **IoT** | http://localhost:3004 | Dispositivos y sensores |
| **PostgreSQL** | localhost:5432 | Base de datos |
| **Redis** | localhost:6379 | Cache |
| **MQTT** | localhost:1883 | Broker IoT |

## 🧪 Primeras Pruebas

### 1. Registrar un Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "name": "Admin User"
  }'
```

### 2. Iniciar Sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```

### 3. Crear un Producto
```bash
# Usar el token obtenido del login
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "name": "Laptop HP",
    "description": "Laptop para desarrollo",
    "price": 15000,
    "category": "electronics"
  }'
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f auth-service

# Reiniciar un servicio
docker-compose restart product-service

# Parar todo
docker-compose down

# Parar y limpiar volúmenes
docker-compose down -v
```

### Base de Datos
```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U admin -d inventory_db

# Ver tablas
\dt

# Conectar a Redis
docker-compose exec redis redis-cli
```

## 📚 Siguientes Pasos

1. **Lee la [Guía de Arquitectura](./docs/ARCHITECTURE_GUIDE.md)** para entender mejor los microservicios
2. **Explora la [Guía de Desarrollo](./docs/DEVELOPMENT_GUIDE.md)** para comenzar a programar
3. **Revisa la [Documentación de API](./docs/API_CONTRACT_GUIDE.md)** para ver todos los endpoints disponibles
4. **Prueba el [IoT con NFC](./docs/IOT_GUIDE.md)** para dispositivos físicos

## 🆘 Solución de Problemas

### Puerto ya en uso
```bash
# Ver qué está usando el puerto
netstat -an | findstr :3000

# Cambiar puertos en docker-compose.yml si es necesario
```

### Servicios no se conectan
```bash
# Verificar la red de Docker
docker network ls
docker network inspect comsoc_inventory_network
```

### Base de datos no inicializa
```bash
# Recrear volúmenes
docker-compose down -v
docker-compose up --build
```

## 💡 Tips para Principiantes

1. **Comienza con el Frontend**: Abre http://localhost:3005 y familiarízate con la interfaz
2. **Entiende el API Gateway**: Es tu punto de entrada único, como una recepción en un edificio
3. **Un servicio a la vez**: Estudia primero `auth-service`, luego `product-service`, etc.
4. **Usa Postman**: Importa las colecciones de API desde `./docs/postman/`
5. **Lee los logs**: `docker-compose logs -f` es tu mejor amigo para debugear

¡Listo para comenzar! 🎉
