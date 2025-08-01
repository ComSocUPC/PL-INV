# 🏭 Ejemplo Simple de Almacén - Microservicios + IoT

¡Bienvenido al proyecto educativo más completo de microservicios con IoT! 🎓

Este es un **ejemplo práctico y funcional** de un sistema de almacén que utiliza arquitectura de microservicios, dispositivos IoT, y cumple con estándares OpenAPI. Diseñado específicamente para **aprender** y **entender** conceptos avanzados de manera práctica.

## 🎯 Objetivo Educativo

Este proyecto te enseña:
- ✅ **Arquitectura de Microservicios** real y funcional
- ✅ **Integración IoT** con sensores y dispositivos NFC
- ✅ **APIs REST** siguiendo estándares OpenAPI 3.0.3
- ✅ **Docker & Docker Compose** para orquestación
- ✅ **Comunicación en tiempo real** con WebSockets
- ✅ **Bases de datos** SQLite para simplicidad
- ✅ **Sistemas de alertas** automáticas
- ✅ **Documentación técnica** completa

## 🏗️ Arquitectura del Sistema

```
🌐 Internet
     │
┌────▼─────────────────────────────────────────────┐
│               API Gateway                        │
│            (Puerto 3000)                        │
│         Punto de entrada único                   │
└────┬─────────────┬─────────────┬─────────────────┘
     │             │             │
┌────▼──────┐ ┌────▼──────┐ ┌────▼──────────────┐
│   Auth    │ │ Products  │ │       IoT         │
│ Service   │ │ Service   │ │    Service        │
│(Puerto    │ │(Puerto    │ │  (Puerto 3003)    │
│ 3001)     │ │ 3002)     │ │                   │
│           │ │           │ │ 📱 NFC Readers    │
│🔐 JWT     │ │🛍️ CRUD    │ │🌡️ Temp Sensors   │
│👤 Users   │ │📦 Stock   │ │💧 Humidity        │
│🔑 Auth    │ │🔍 Search  │ │🚨 Alerts          │
└───────────┘ └───────────┘ │🔄 WebSockets      │
                             │⏰ Cron Jobs       │
                             └───────────────────┘
```

## 📦 Servicios Incluidos

### 🚪 **API Gateway** (Puerto 3000)
- **Propósito**: Punto de entrada único al sistema
- **Funciones**: Enrutamiento, autenticación, rate limiting
- **Tecnologías**: Node.js, Express, Proxy middleware
- **Endpoints**: Unifica todos los servicios bajo una sola URL

### 🔐 **Auth Service** (Puerto 3001)
- **Propósito**: Autenticación y autorización de usuarios
- **Funciones**: Login, registro, JWT, gestión de usuarios
- **Tecnologías**: Node.js, SQLite, bcryptjs, JWT
- **Base de datos**: `warehouse_auth.db`

### 🛍️ **Product Service** (Puerto 3002)
- **Propósito**: Gestión completa del catálogo de productos
- **Funciones**: CRUD, búsqueda, filtros, gestión de stock
- **Tecnologías**: Node.js, SQLite, validaciones Joi
- **Base de datos**: `warehouse_products.db`

### 🌐 **IoT Service** (Puerto 3003)
- **Propósito**: Manejo de dispositivos IoT y sensores
- **Funciones**: NFC, sensores, alertas, WebSockets, simuladores
- **Tecnologías**: Node.js, SQLite, WebSockets, cron
- **Base de datos**: `warehouse_iot.db`

## 🚀 Inicio Rápido

### Prerrequisitos:
- Docker & Docker Compose
- Git
- Puerto 3000-3003 disponibles

### 1️⃣ Clonar y navegar:
```bash
cd example-simple-warehouse
```

### 2️⃣ Ejecutar todo el sistema:
```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f
```

### 3️⃣ Verificar que todo funciona:
```bash
# Verificar estado de servicios
docker-compose ps

# Probar API Gateway
curl http://localhost:3000/health

# Probar cada servicio
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Products
curl http://localhost:3003/health  # IoT
```

## 🌐 URLs del Sistema

Una vez ejecutándose, accede a:

| Servicio | URL | Documentación API |
|----------|-----|-------------------|
| **API Gateway** | http://localhost:3000 | http://localhost:3000/api-docs |
| **Auth Service** | http://localhost:3001 | http://localhost:3001/api-docs |
| **Product Service** | http://localhost:3002 | http://localhost:3002/api-docs |
| **IoT Service** | http://localhost:3003 | http://localhost:3003/api-docs |

## 🧪 Ejemplos Prácticos

### Autenticación:
```bash
# Iniciar sesión (usuario predeterminado)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

### Gestión de Productos:
```bash
# Obtener productos
curl http://localhost:3000/api/products

# Buscar productos
curl http://localhost:3000/api/products/search/laptop

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nuevo Producto",
    "code": "NP-001",
    "category": "Test",
    "price": 99.99,
    "stock": 10
  }'
```

### IoT y Sensores:
```bash
# Listar dispositivos IoT
curl http://localhost:3000/api/iot/devices

# Simular lectura NFC
curl -X POST http://localhost:3000/api/iot/simulate/nfc \
  -H "Content-Type: application/json" \
  -d '{"device_id": "NFC-ENTRANCE-001"}'

# Simular sensor de temperatura
curl -X POST http://localhost:3000/api/iot/simulate/sensor \
  -H "Content-Type: application/json" \
  -d '{"device_id": "TEMP-COLD-001", "sensor_type": "temperature"}'
```

### WebSockets (Tiempo Real):
```javascript
// Conectar a IoT WebSocket
const ws = new WebSocket('ws://localhost:3003/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento IoT:', data);
};
```

## 📊 Datos de Ejemplo

El sistema se autoconfigura con datos de ejemplo para pruebas inmediatas:

### 👤 Usuarios:
- **admin** / 123456 (Administrador)

### 🛍️ Productos:
- Laptop Dell Inspiron 15 (LAP-DELL-001)
- Silla de Oficina Ergonómica (SIL-ERG-001)
- Papel Bond A4 (PAP-A4-500)
- Monitor LED 24 pulgadas (MON-LED-24)
- Café Premium 1kg (CAF-PREM-1K)

### 📱 Dispositivos IoT:
- Lectores NFC (Entrada, Almacén)
- Sensores de Temperatura (Área Fría, Oficinas)
- Sensores de Humedad (Depósito General)

## 🔧 Desarrollo

### Estructura del Proyecto:
```
example-simple-warehouse/
├── api-gateway/           # 🚪 API Gateway
│   ├── index.js          # Servidor principal
│   ├── package.json      # Dependencias
│   ├── Dockerfile        # Imagen Docker
│   └── README.md         # Documentación
├── auth-service/          # 🔐 Servicio de Autenticación
│   ├── index.js          # Servidor + endpoints
│   ├── database.js       # SQLite operations
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── product-service/       # 🛍️ Servicio de Productos
│   ├── index.js          # Servidor + CRUD completo
│   ├── database.js       # SQLite con búsquedas
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── iot-service/          # 🌐 Servicio IoT
│   ├── index.js          # Servidor + WebSockets
│   ├── database.js       # Time series data
│   ├── iot-simulator.js  # Simuladores IoT
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
├── docker-compose.yml    # 🐳 Orquestación completa
└── README.md            # Esta documentación
```

### Comandos de Desarrollo:

```bash
# Desarrollo individual de servicios
cd auth-service && npm run dev
cd product-service && npm run dev
cd iot-service && npm run dev

# Reconstruir solo un servicio
docker-compose up -d --build auth-service

# Ver logs de un servicio específico
docker-compose logs -f product-service

# Reiniciar servicio específico
docker-compose restart iot-service
```

## 🧠 Conceptos Aprendidos

### 🎓 **Nivel Principiante:**
- ✅ Qué son los microservicios
- ✅ Diferencia entre monolito y microservicios
- ✅ APIs REST básicas
- ✅ Docker containers
- ✅ SQLite databases

### 🎓 **Nivel Intermedio:**
- ✅ Comunicación entre microservicios
- ✅ API Gateway pattern
- ✅ Service discovery
- ✅ Health checks
- ✅ Data consistency

### 🎓 **Nivel Avanzado:**
- ✅ IoT device integration
- ✅ Real-time communication (WebSockets)
- ✅ Event-driven architecture
- ✅ Alert systems
- ✅ Distributed monitoring

## 🔗 Próximos Pasos

Para expandir tu aprendizaje:

1. **🎨 Frontend**: Crear interfaz React/Vue.js
2. **📊 Monitoring**: Agregar Prometheus + Grafana
3. **🗄️ Database**: Migrar a PostgreSQL
4. **🔒 Security**: Implementar OAuth 2.0
5. **📨 Messaging**: Agregar Redis/RabbitMQ
6. **☁️ Cloud**: Desplegar en AWS/Azure
7. **🧪 Testing**: Tests automatizados
8. **📈 Scaling**: Kubernetes orchestration

## 🆘 Solución de Problemas

### Puerto ocupado:
```bash
# Verificar puertos en uso
netstat -tulpn | grep :3000

# Cambiar puertos en docker-compose.yml si es necesario
```

### Servicios no responden:
```bash
# Verificar logs
docker-compose logs api-gateway
docker-compose logs auth-service

# Reiniciar servicios
docker-compose restart
```

### Limpiar sistema:
```bash
# Parar y limpiar todo
docker-compose down -v
docker system prune -f

# Reiniciar desde cero
docker-compose up -d --build
```

## 🏆 ¿Por qué este proyecto es especial?

1. **🎯 100% Funcional**: No es solo teoría, ¡funciona de verdad!
2. **📚 Súper Documentado**: Cada línea de código está explicada
3. **🔧 Fácil de Ejecutar**: Un comando y tienes todo funcionando
4. **🌐 Tecnologías Reales**: Las mismas que usan las empresas
5. **🎮 Datos de Prueba**: Listo para experimentar inmediatamente
6. **📖 Aprende Haciendo**: Modifica y ve los resultados al instante

## 📜 Licencia

MIT License - Úsalo libremente para aprender y enseñar.

---

**¡Feliz aprendizaje! 🚀** 

*Si este proyecto te ayudó a entender microservicios e IoT, ¡compártelo con otros desarrolladores!*
