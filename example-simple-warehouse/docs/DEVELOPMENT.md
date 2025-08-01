# 🛠️ Guía de Desarrollo - Sistema de Almacén

Esta guía te ayudará a configurar tu entorno de desarrollo, entender el flujo de trabajo, y contribuir al proyecto de manera efectiva.

## 🎯 Configuración del Entorno de Desarrollo

### 📦 Prerrequisitos Locales:
- **Node.js** (versión 18+)
- **npm** o **yarn**
- **Docker** y **Docker Compose**
- **Git**
- **IDE recomendado**: VS Code

### 🔧 Configuración Inicial:

#### **1. Clonar el Repositorio:**
```bash
git clone <repository-url>
cd example-simple-warehouse
```

#### **2. Instalar Dependencias:**
```bash
# Instalar dependencias en todos los servicios
./scripts/install-all.sh

# O manualmente en cada servicio:
cd api-gateway && npm install
cd ../auth-service && npm install
cd ../product-service && npm install
cd ../iot-service && npm install
```

#### **3. Configurar Variables de Entorno:**
```bash
# Copiar archivos de ejemplo
cp .env.example .env
cp auth-service/.env.example auth-service/.env
cp product-service/.env.example product-service/.env
cp iot-service/.env.example iot-service/.env

# Configurar valores locales
# .env
NODE_ENV=development
JWT_SECRET=desarrollo-secreto-local
LOG_LEVEL=debug
```

#### **4. Ejecutar en Modo Desarrollo:**
```bash
# Opción A: Con Docker (recomendado)
docker-compose up -d

# Opción B: Local con hot-reload
npm run dev:all

# Opción C: Servicio por servicio
cd auth-service && npm run dev
cd product-service && npm run dev
cd iot-service && npm run dev
cd api-gateway && npm run dev
```

## 🏗️ Arquitectura de Desarrollo

### **Estructura del Proyecto:**
```
example-simple-warehouse/
├── api-gateway/           # 🚪 Punto de entrada principal
│   ├── src/
│   │   ├── routes/        # Rutas del gateway
│   │   ├── middleware/    # Middlewares (auth, rate limit)
│   │   └── utils/         # Utilidades
│   ├── package.json       # Dependencias del gateway
│   └── Dockerfile         # Container del gateway
├── auth-service/          # 🔐 Servicio de autenticación
│   ├── src/
│   │   ├── controllers/   # Lógica de autenticación
│   │   ├── models/        # Modelos de usuario
│   │   └── database/      # Configuración DB
│   └── ...
├── product-service/       # 🛍️ Servicio de productos
│   ├── src/
│   │   ├── controllers/   # CRUD de productos
│   │   ├── models/        # Modelos de producto
│   │   └── database/      # Configuración DB
│   └── ...
├── iot-service/          # 🌐 Servicio IoT
│   ├── src/
│   │   ├── controllers/   # Gestión de dispositivos
│   │   ├── simulator/     # Simulador IoT
│   │   └── websocket/     # WebSocket para tiempo real
│   └── ...
├── docs/                 # 📚 Documentación
├── scripts/              # 🔧 Scripts de automatización
└── docker-compose.yml    # 🐳 Orquestación de servicios
```

### **Flujo de Comunicación:**
```
Cliente → API Gateway → Servicio Específico → Respuesta
                ↓
             Auth Service (validación JWT)
                ↓
             IoT Service (eventos en tiempo real)
```

## 🚀 Flujo de Desarrollo

### **1. Configuración de Git:**
```bash
# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu@email.com"

# Configurar hooks (opcional)
cp scripts/git-hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

### **2. Crear Nueva Característica:**
```bash
# Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Hacer cambios...
# Commit con mensaje descriptivo
git add .
git commit -m "feat(products): add product search functionality"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### **3. Convenciones de Commit:**
```bash
# Tipos de commit:
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato (no lógica)
refactor: # Refactorización de código
test:     # Agregar o modificar tests
chore:    # Tareas de mantenimiento

# Ejemplos:
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(products): resolve inventory count bug"
git commit -m "docs(api): update OpenAPI specification"
```

## 🧪 Testing y Calidad

### **Ejecutar Tests:**
```bash
# Todos los tests
npm run test:all

# Tests por servicio
cd auth-service && npm test
cd product-service && npm test
cd iot-service && npm test

# Tests con cobertura
npm run test:coverage

# Tests de integración
npm run test:integration
```

### **Estructura de Tests:**
```
auth-service/
├── src/
└── __tests__/
    ├── unit/          # Tests unitarios
    │   ├── controllers/
    │   └── models/
    ├── integration/   # Tests de integración
    └── fixtures/      # Datos de prueba
```

### **Ejemplo de Test Unitario:**
```javascript
// __tests__/unit/controllers/auth.test.js
const { login } = require('../../../src/controllers/auth');

describe('Auth Controller', () => {
  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      // Given
      const validUser = { username: 'admin', password: '123456' };
      
      // When
      const result = await login(validUser);
      
      // Then
      expect(result.success).toBe(true);
      expect(result.data.token).toBeDefined();
    });
    
    it('should return error for invalid credentials', async () => {
      // Given
      const invalidUser = { username: 'admin', password: 'wrong' };
      
      // When
      const result = await login(invalidUser);
      
      // Then
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });
});
```

### **Test de Integración con Supertest:**
```javascript
// __tests__/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/index');

describe('Auth API Integration', () => {
  it('POST /api/auth/login should authenticate user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: '123456'
      })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### **Linting y Formato:**
```bash
# ESLint
npm run lint
npm run lint:fix

# Prettier
npm run format
npm run format:check

# Configuración automática en VS Code
# .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📡 Desarrollo de APIs

### **Estructura de Controlador:**
```javascript
// src/controllers/productController.js
const Joi = require('joi');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
const getAllProducts = async (req, res) => {
  try {
    // 1. Validar parámetros de entrada
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    });
    
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    // 2. Lógica de negocio
    const products = await productService.getAllProducts(value);
    
    // 3. Respuesta exitosa
    res.json({
      success: true,
      data: products,
      pagination: {
        page: value.page,
        limit: value.limit,
        total: products.length
      }
    });
    
  } catch (error) {
    // 4. Manejo de errores
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = { getAllProducts };
```

### **Middleware de Validación:**
```javascript
// src/middleware/validation.js
const Joi = require('joi');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        details: error.details
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

// Schemas comunes
const schemas = {
  product: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
    category: Joi.string().required()
  }),
  
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
  })
};

module.exports = { validateBody, schemas };
```

### **Uso en Rutas:**
```javascript
// src/routes/products.js
const express = require('express');
const { validateBody, schemas } = require('../middleware/validation');
const { getAllProducts, createProduct } = require('../controllers/productController');

const router = express.Router();

// GET /api/products
router.get('/', getAllProducts);

// POST /api/products
router.post('/', 
  validateBody(schemas.product),
  createProduct
);

module.exports = router;
```

## 🌐 Desarrollo IoT y WebSockets

### **Configurar WebSocket Server:**
```javascript
// src/websocket/server.js
const WebSocket = require('ws');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      console.log(`📱 Cliente conectado: ${clientId}`);
      
      // Enviar mensaje de bienvenida
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Conectado al sistema IoT',
        clientId
      }));
      
      // Manejar mensajes
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      // Manejar desconexión
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`📱 Cliente desconectado: ${clientId}`);
      });
    });
  }
  
  // Broadcast a todos los clientes
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
  
  // Enviar a cliente específico
  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

module.exports = WebSocketServer;
```

### **Simulador IoT:**
```javascript
// src/simulator/iotSimulator.js
class IoTSimulator {
  constructor(websocketServer) {
    this.ws = websocketServer;
    this.devices = new Map();
    this.startSimulation();
  }
  
  // Simular lectura NFC
  simulateNFC(deviceId, tagData) {
    const event = {
      type: 'nfc_read',
      device_id: deviceId,
      timestamp: new Date().toISOString(),
      data: {
        tag_id: tagData.tag_id || this.generateTagId(),
        tag_type: 'NTAG213',
        user_id: tagData.user_id,
        access_granted: tagData.access_granted || true
      }
    };
    
    // Enviar evento por WebSocket
    this.ws.broadcast({
      type: 'iot_event',
      event
    });
    
    return event;
  }
  
  // Simular sensor de temperatura
  simulateTemperature(deviceId) {
    const temperature = 18 + Math.random() * 10; // 18-28°C
    
    const event = {
      type: 'temperature_reading',
      device_id: deviceId,
      timestamp: new Date().toISOString(),
      data: {
        temperature: Math.round(temperature * 100) / 100,
        unit: 'celsius',
        status: temperature > 25 ? 'warning' : 'normal'
      }
    };
    
    this.ws.broadcast({
      type: 'iot_event',
      event
    });
    
    return event;
  }
  
  // Simulación automática cada 30 segundos
  startSimulation() {
    setInterval(() => {
      // Simular temperatura del almacén
      this.simulateTemperature('TEMP-WAREHOUSE-001');
      
      // Simular acceso aleatorio
      if (Math.random() > 0.7) {
        this.simulateNFC('NFC-ENTRANCE-001', {
          user_id: `user_${Math.floor(Math.random() * 10)}`,
          access_granted: Math.random() > 0.1
        });
      }
    }, 30000);
  }
}

module.exports = IoTSimulator;
```

### **Cliente WebSocket (Frontend):**
```javascript
// Frontend - client.js
class IoTClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('🌐 Conectado al sistema IoT');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      console.log('🔌 Conexión cerrada');
      this.reconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('❌ Error WebSocket:', error);
    };
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'iot_event':
        this.updateUI(data.event);
        break;
      case 'connection':
        console.log(`✅ ${data.message}`);
        break;
    }
  }
  
  updateUI(event) {
    // Actualizar interfaz según el tipo de evento
    const eventList = document.getElementById('iot-events');
    const eventElement = document.createElement('div');
    eventElement.innerHTML = `
      <div class="iot-event ${event.type}">
        <strong>${event.type}</strong>
        <span class="timestamp">${new Date(event.timestamp).toLocaleString()}</span>
        <pre>${JSON.stringify(event.data, null, 2)}</pre>
      </div>
    `;
    eventList.prepend(eventElement);
  }
  
  simulateNFC(deviceId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'simulate_nfc',
        device_id: deviceId
      }));
    }
  }
}

// Inicializar cliente
const iotClient = new IoTClient('ws://localhost:3003/ws');
iotClient.connect();
```

## 🔧 Scripts de Automatización

### **package.json Scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "build": "docker build -t warehouse-auth .",
    "docs": "swagger-jsdoc -d swagger.config.js -o docs/openapi.json"
  }
}
```

### **Script de Instalación Global:**
```bash
#!/bin/bash
# scripts/install-all.sh

echo "📦 Instalando dependencias en todos los servicios..."

services=("api-gateway" "auth-service" "product-service" "iot-service")

for service in "${services[@]}"; do
    echo "Instalando dependencias en $service..."
    cd "$service"
    npm install
    cd ..
    echo "✅ $service completado"
done

echo "🎉 Todas las dependencias instaladas!"
```

### **Script de Testing Global:**
```bash
#!/bin/bash
# scripts/test-all.sh

echo "🧪 Ejecutando tests en todos los servicios..."

services=("api-gateway" "auth-service" "product-service" "iot-service")
failed_services=()

for service in "${services[@]}"; do
    echo "Testing $service..."
    cd "$service"
    
    if npm test; then
        echo "✅ $service: PASSED"
    else
        echo "❌ $service: FAILED"
        failed_services+=("$service")
    fi
    
    cd ..
done

if [ ${#failed_services[@]} -eq 0 ]; then
    echo "🎉 Todos los tests pasaron!"
    exit 0
else
    echo "❌ Tests fallaron en: ${failed_services[*]}"
    exit 1
fi
```

## 🐛 Debugging y Logging

### **Configurar Logging:**
```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

module.exports = logger;
```

### **Debug con VS Code:**
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Auth Service",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/auth-service/src/index.js",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "*"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### **Usar Debugger:**
```javascript
// En cualquier archivo
debugger; // Breakpoint

// O con console
console.log('🐛 Debug info:', { variable, data });

// Logging estructurado
logger.debug('Processing request', { 
  userId: req.user.id, 
  action: 'get_products' 
});
```

## 📈 Performance y Optimización

### **Monitoring Local:**
```javascript
// src/middleware/metrics.js
const responseTime = require('response-time');

const metricsMiddleware = responseTime((req, res, time) => {
  const stat = (req.method + req.url)
    .toLowerCase()
    .replace(/[:.]/g, '')
    .replace(/\//g, '_');
    
  console.log(`📊 ${stat}: ${time.toFixed(2)}ms`);
});

module.exports = metricsMiddleware;
```

### **Profiling de Memoria:**
```bash
# Ejecutar con profiling
node --inspect src/index.js

# Abrir Chrome DevTools
# chrome://inspect
```

### **Optimizaciones Docker:**
```dockerfile
# Dockerfile optimizado
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
RUN adduser -D -s /bin/sh appuser
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=appuser:appuser . .
USER appuser
EXPOSE 3000
CMD ["node", "src/index.js"]
```

## 🤝 Colaboración y Code Review

### **Checklist antes de PR:**
- [ ] Tests pasando ✅
- [ ] Linting sin errores ✅
- [ ] Documentación actualizada ✅
- [ ] OpenAPI spec actualizada ✅
- [ ] Variables de entorno documentadas ✅
- [ ] Logs apropiados agregados ✅
- [ ] Error handling implementado ✅

### **Template de Pull Request:**
```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🔄 Tipo de cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 💥 Breaking change
- [ ] 📚 Documentación

## 🧪 Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración pasando
- [ ] Tested manualmente

## 📋 Checklist
- [ ] Código sigue las convenciones del proyecto
- [ ] Self-review realizado
- [ ] Documentación actualizada
- [ ] No hay console.logs innecesarios
```

---

**¡Con esta guía tienes todo lo necesario para desarrollar de manera efectiva!** 🚀
