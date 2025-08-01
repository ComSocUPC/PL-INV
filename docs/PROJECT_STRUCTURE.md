# 📁 Estructura del Proyecto - Versión Didáctica

Esta estructura está diseñada para ser comprensible para desarrolladores que vienen de arquitecturas de 3 capas.

## 🏗️ Estructura Principal

```
inventory-system/
│
├── 📁 1-frontend/                    # 🎨 CAPA DE PRESENTACIÓN
│   ├── 📄 Dockerfile                # Contiene toda la UI
│   ├── 📄 package.json              # React, componentes, estilos
│   ├── 📁 src/                      # Interactúa solo con API Gateway
│   │   ├── 📁 components/
│   │   ├── 📁 pages/
│   │   ├── 📁 services/
│   │   └── 📄 App.js
│   └── 📄 README.md
│
├── 📁 2-backend/                     # ⚙️ CAPA DE SERVICIOS
│   │                                # Equivale al "Backend" tradicional
│   │                                # pero dividido en servicios especializados
│   │
│   ├── 📁 api-gateway/              # 🚪 Puerta de entrada única
│   │   ├── 📄 Dockerfile            # Routing, autenticación, rate limiting
│   │   ├── 📄 package.json          # Como un "controlador principal"
│   │   ├── 📁 src/
│   │   │   ├── 📄 app.js            # Punto de entrada
│   │   │   ├── 📁 routes/           # Rutas que redirigen a servicios
│   │   │   ├── 📁 middleware/       # Auth, cors, validation
│   │   │   └── 📁 utils/
│   │   └── 📄 README.md
│   │
│   ├── 📁 auth-service/             # 🔐 Servicio de Autenticación
│   │   ├── 📄 Dockerfile            # Login, registro, JWT
│   │   ├── 📄 package.json          # Manejo de usuarios
│   │   ├── 📁 src/
│   │   │   ├── 📄 app.js
│   │   │   ├── 📁 controllers/      # Lógica de auth
│   │   │   ├── 📁 models/           # Usuario, roles
│   │   │   ├── 📁 services/         # JWT, bcrypt
│   │   │   └── 📁 middleware/
│   │   └── 📄 README.md
│   │
│   ├── 📁 product-service/          # 📦 Servicio de Productos
│   │   ├── 📄 Dockerfile            # Catálogo, categorías, búsqueda
│   │   ├── 📄 package.json          # CRUD de productos
│   │   ├── 📁 src/
│   │   │   ├── 📄 app.js
│   │   │   ├── 📁 controllers/      # Lógica de productos
│   │   │   ├── 📁 models/           # Producto, categoría
│   │   │   ├── 📁 services/         # Búsqueda, validación
│   │   │   └── 📁 utils/
│   │   └── 📄 README.md
│   │
│   ├── 📁 inventory-service/        # 📊 Servicio de Inventario
│   │   ├── 📄 Dockerfile            # Stock, movimientos, alertas
│   │   ├── 📄 package.json          # Control de inventario
│   │   ├── 📁 src/
│   │   │   ├── 📄 app.js
│   │   │   ├── 📁 controllers/      # Lógica de inventario
│   │   │   ├── 📁 models/           # Stock, movimiento
│   │   │   ├── 📁 services/         # Cálculos, alertas
│   │   │   └── 📁 events/           # Eventos MQTT
│   │   └── 📄 README.md
│   │
│   └── 📁 iot-service/              # 🌐 Servicio IoT
│       ├── 📄 Dockerfile            # NFC, sensores, MQTT
│       ├── 📄 package.json          # Comunicación con dispositivos
│       ├── 📁 src/
│       │   ├── 📄 app.js
│       │   ├── 📁 controllers/      # Manejo de dispositivos
│       │   ├── 📁 models/           # Dispositivo, evento
│       │   ├── 📁 services/         # MQTT, NFC
│       │   └── 📁 protocols/        # Protocolos IoT
│       └── 📄 README.md
│
├── 📁 3-database/                    # 💾 CAPA DE DATOS
│   ├── 📁 postgres/                 # Base de datos principal
│   │   ├── 📄 Dockerfile            # PostgreSQL configurado
│   │   ├── 📁 init/                 # Scripts de inicialización
│   │   │   ├── 📄 01-create-schemas.sql
│   │   │   ├── 📄 02-create-tables.sql
│   │   │   └── 📄 03-sample-data.sql
│   │   └── 📁 migrations/           # Migraciones de BD
│   ├── 📁 redis/                    # Cache y sesiones
│   │   ├── 📄 Dockerfile
│   │   └── 📄 redis.conf
│   └── 📁 mqtt/                     # Message broker para IoT
│       ├── 📄 Dockerfile
│       └── 📄 mosquitto.conf
│
├── 📁 shared/                        # 🔧 RECURSOS COMPARTIDOS
│   ├── 📁 config/                   # Configuraciones comunes
│   │   ├── 📄 database.js
│   │   ├── 📄 redis.js
│   │   └── 📄 mqtt.js
│   ├── 📁 utils/                    # Utilidades comunes
│   │   ├── 📄 logger.js
│   │   ├── 📄 validator.js
│   │   └── 📄 error-handler.js
│   └── 📁 middleware/               # Middleware compartido
│       ├── 📄 auth.js
│       ├── 📄 cors.js
│       └── 📄 rate-limit.js
│
├── 📁 docs/                          # 📚 DOCUMENTACIÓN
│   ├── 📄 ARCHITECTURE_GUIDE.md     # Guía de arquitectura
│   ├── 📄 GETTING_STARTED.md        # Inicio rápido
│   ├── 📄 API_DOCUMENTATION.md      # Docs de API
│   ├── 📄 DEVELOPMENT_GUIDE.md      # Guía de desarrollo
│   └── 📄 DEPLOYMENT_GUIDE.md       # Guía de despliegue
│
├── 📁 scripts/                       # 🛠️ SCRIPTS DE AUTOMATIZACIÓN
│   ├── 📄 start-dev.sh             # Iniciar desarrollo
│   ├── 📄 run-tests.sh             # Ejecutar pruebas
│   ├── 📄 build-all.sh             # Construir todo
│   └── 📄 deploy.sh                # Desplegar
│
├── 📁 tests/                         # 🧪 PRUEBAS
│   ├── 📁 integration/              # Tests de integración
│   ├── 📁 e2e/                     # Tests end-to-end
│   └── 📁 performance/             # Tests de rendimiento
│
├── 📄 docker-compose.yml            # 🐳 ORQUESTACIÓN PRINCIPAL
├── 📄 docker-compose.dev.yml        # Desarrollo
├── 📄 docker-compose.test.yml       # Testing
├── 📄 docker-compose.prod.yml       # Producción
├── 📄 package.json                  # Scripts del proyecto
├── 📄 .env.example                  # Variables de entorno
└── 📄 README.md                     # Documentación principal
```

## 🎯 Analogía con 3 Capas Tradicionales

### En un Sistema de 3 Capas Tradicional:

```
Frontend (React)
    ↓ HTTP
Backend (Node.js + Express)
    ↓ SQL
Database (PostgreSQL)
```

### En Nuestro Sistema de Microservicios:

```
1-frontend (React)
    ↓ HTTP
2-backend/api-gateway (Entrada única)
    ↓ HTTP interno
2-backend/[auth|product|inventory|iot]-service
    ↓ SQL/Redis/MQTT
3-database/[postgres|redis|mqtt]
```

## 🔄 Flujo de Datos Simplificado

### 1. Petición del Usuario
```
Usuario → Frontend → API Gateway → Servicio Específico → Base de Datos
```

### 2. Ejemplo Práctico: "Ver Productos"
```
1. Usuario hace clic en "Productos"
2. Frontend llama a /api/products
3. API Gateway autentica y redirige a product-service
4. Product Service consulta la base de datos
5. Respuesta regresa por el mismo camino
```

### 3. Ejemplo con IoT: "Escaneo NFC"
```
1. Dispositivo NFC escanea producto
2. IoT Service recibe evento MQTT
3. IoT Service consulta product-service por HTTP
4. IoT Service actualiza inventory-service
5. Frontend recibe notificación en tiempo real
```

## 📋 Comparación Práctica

| Aspecto | 3 Capas Tradicional | Nuestros Microservicios |
|---------|---------------------|-------------------------|
| **Estructura** | `src/` con todo mezclado | Carpetas separadas por servicio |
| **Base de Datos** | Una sola BD | BD compartida (simplificado) |
| **Deployment** | Un solo `docker build` | `docker-compose` orquesta todo |
| **Desarrollo** | Un solo servidor | Múltiples servicios independientes |
| **URLs** | `/api/products`, `/api/auth` | API Gateway redirige internamente |

## 🚀 Ventajas de Esta Organización

### Para Principiantes:
1. **Separación Clara**: Cada carpeta tiene una responsabilidad
2. **Progresión Natural**: Puedes empezar con un servicio
3. **Dockerfiles Simples**: Cada servicio tiene su propio contenedor
4. **Debugging Fácil**: Sabes exactamente dónde buscar

### Para el Proyecto:
1. **Escalabilidad**: Cada servicio se escala independientemente
2. **Mantenimiento**: Equipos diferentes pueden trabajar en servicios diferentes
3. **Tecnología**: Cada servicio puede usar tecnologías diferentes
4. **Testing**: Puedes probar servicios por separado

## 🛠️ Cómo Empezar

### Opción 1: Todo de una vez
```bash
docker-compose up --build
```

### Opción 2: Servicio por servicio
```bash
# Solo base de datos
docker-compose up postgres redis

# Agregar auth service
docker-compose up postgres redis auth-service

# Agregar product service
docker-compose up postgres redis auth-service product-service

# Y así sucesivamente...
```

### Opción 3: Desarrollo local
```bash
# Bases de datos en Docker, servicios en local
docker-compose up postgres redis mqtt
npm run dev:auth-service
npm run dev:product-service
# etc...
```

## 🎓 Path de Aprendizaje Recomendado

1. **Semana 1**: Entiende la estructura, ejecuta todo con Docker Compose
2. **Semana 2**: Modifica un servicio (ej: product-service)
3. **Semana 3**: Agrega un endpoint nuevo
4. **Semana 4**: Entiende la comunicación entre servicios
5. **Semana 5**: Implementa una funcionalidad que use múltiples servicios

## 💡 Tips para Principiantes

- **Empieza simple**: Concentrarte en un servicio a la vez
- **Usa logs**: Cada servicio logea lo que hace
- **API Gateway es tu amigo**: Es el punto de entrada único
- **Docker Compose es magia**: Orquesta todo automáticamente
- **No te abrumes**: Los microservicios se ven complejos, pero cada pieza es simple

---

Esta estructura mantiene la potencia de los microservicios pero con una organización que tiene sentido para alguien que viene del mundo de 3 capas. ¿Te parece más clara esta organización?
