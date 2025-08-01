# ⚙️ Backend - Capa de Servicios

Esta carpeta contiene toda la lógica de negocio dividida en microservicios especializados.

## 📋 ¿Qué es esto?

En una arquitectura de 3 capas tradicional, tendrías **UN** backend que hace todo. Aquí tenemos **MÚLTIPLES** servicios pequeños, cada uno especializado en una función específica:

```
Backend Tradicional (Monolito)    →    Microservicios Especializados
┌─────────────────────────────┐         ┌──────────┐ ┌──────────┐ ┌──────────┐
│                             │         │   AUTH   │ │ PRODUCTS │ │INVENTORY │
│  - Autenticación            │    →    │ SERVICE  │ │ SERVICE  │ │ SERVICE  │
│  - Gestión de productos     │         └──────────┘ └──────────┘ └──────────┘
│  - Control de inventario    │         
│  - Comunicación IoT         │         ┌──────────┐ ┌──────────┐
│  - APIs                     │    →    │   IOT    │ │    API   │
│  - Validaciones             │         │ SERVICE  │ │ GATEWAY  │
│                             │         └──────────┘ └──────────┘
└─────────────────────────────┘
```

## 🏗️ Estructura

```
2-backend/
│
├── 📁 api-gateway/              # 🚪 Puerta de entrada (Equivale al router principal)
│   ├── 📄 Dockerfile           # - Recibe todas las peticiones del frontend
│   ├── 📄 package.json         # - Autentica usuarios
│   ├── 📁 src/                 # - Redirige a servicios correctos
│   │   ├── app.js              # - Rate limiting, CORS
│   │   ├── 📁 routes/          # - Logging centralizado
│   │   ├── 📁 middleware/
│   │   └── 📁 utils/
│   └── 📄 README.md
│
├── 📁 auth-service/             # 🔐 Especialista en Autenticación
│   ├── 📄 Dockerfile           # - Login/Logout
│   ├── 📄 package.json         # - Registro de usuarios
│   ├── 📁 src/                 # - JWT tokens
│   │   ├── app.js              # - Roles y permisos
│   │   ├── 📁 controllers/     # - Hash de contraseñas
│   │   ├── 📁 models/
│   │   ├── 📁 services/
│   │   └── 📁 middleware/
│   └── 📄 README.md
│
├── 📁 product-service/          # 📦 Especialista en Productos
│   ├── 📄 Dockerfile           # - CRUD de productos
│   ├── 📄 package.json         # - Gestión de categorías
│   ├── 📁 src/                 # - Búsqueda y filtros
│   │   ├── app.js              # - Validación de datos
│   │   ├── 📁 controllers/     # - Imágenes de productos
│   │   ├── 📁 models/
│   │   ├── 📁 services/
│   │   └── 📁 utils/
│   └── 📄 README.md
│
├── 📁 inventory-service/        # 📊 Especialista en Stock
│   ├── 📄 Dockerfile           # - Control de inventario
│   ├── 📄 package.json         # - Movimientos de stock
│   ├── 📁 src/                 # - Alertas de stock bajo
│   │   ├── app.js              # - Auditoría de movimientos
│   │   ├── 📁 controllers/     # - Integración con IoT
│   │   ├── 📁 models/
│   │   ├── 📁 services/
│   │   └── 📁 events/
│   └── 📄 README.md
│
└── 📁 iot-service/              # 🌐 Especialista en IoT
    ├── 📄 Dockerfile           # - Comunicación con dispositivos NFC
    ├── 📄 package.json         # - Manejo de sensores
    ├── 📁 src/                 # - Protocolo MQTT
    │   ├── app.js              # - Eventos en tiempo real
    │   ├── 📁 controllers/     # - Gestión de dispositivos
    │   ├── 📁 models/
    │   ├── 📁 services/
    │   └── 📁 protocols/
    └── 📄 README.md
```

## 🔄 Cómo Funciona la Comunicación

### 1. Flujo de una Petición

```
Frontend                API Gateway              Servicio Específico
   │                         │                         │
   │─── GET /api/products ───▶│                         │
   │                         │─── GET /products ──────▶│
   │                         │                         │
   │                         │◀──── JSON response ────│
   │◀── JSON response ───────│                         │
```

### 2. Ejemplo Práctico: "Crear Producto"

```javascript
// 1. Frontend envía petición
fetch('/api/products', {
  method: 'POST',
  body: JSON.stringify({ name: 'Laptop', price: 1000 })
});

// 2. API Gateway recibe y autentica
app.post('/products', authenticateToken, (req, res) => {
  // Redirigir a product-service
  proxy('http://product-service:3000')(req, res);
});

// 3. Product Service procesa
app.post('/products', validateProduct, async (req, res) => {
  const product = await Product.create(req.body);
  res.json({ success: true, data: product });
});
```

### 3. Comunicación Entre Servicios

Los servicios se comunican entre ellos cuando es necesario:

```javascript
// inventory-service necesita información de product-service
const getProductInfo = async (productId) => {
  const response = await fetch(`http://product-service:3000/products/${productId}`);
  return response.json();
};

// iot-service notifica a inventory-service sobre cambios
const notifyStockChange = async (productId, newStock) => {
  await fetch('http://inventory-service:3000/stock/update', {
    method: 'POST',
    body: JSON.stringify({ productId, stock: newStock })
  });
};
```

## 🎯 Ventajas de Esta Separación

### ✅ Responsabilidades Claras
```javascript
// ❌ En un monolito: todo mezclado
app.post('/api/products', async (req, res) => {
  // Validar token JWT
  const token = req.headers.authorization;
  if (!jwt.verify(token)) return res.status(401).json({error: 'Unauthorized'});
  
  // Validar producto
  if (!req.body.name) return res.status(400).json({error: 'Name required'});
  
  // Crear producto
  const product = await Product.create(req.body);
  
  // Actualizar inventario
  await Inventory.create({ productId: product.id, stock: 0 });
  
  // Notificar a dispositivos IoT
  mqttClient.publish('products/created', JSON.stringify(product));
  
  res.json(product);
});

// ✅ Con microservicios: cada servicio su responsabilidad
// En product-service: solo gestión de productos
app.post('/products', async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

// En inventory-service: solo gestión de stock
app.post('/inventory', async (req, res) => {
  const inventory = await Inventory.create(req.body);
  res.json(inventory);
});
```

### ✅ Escalabilidad Independiente
```bash
# Si hay mucha carga en productos, escalar solo ese servicio
docker-compose up --scale product-service=3

# El resto de servicios no se ven afectados
```

### ✅ Tecnologías Diferentes
```javascript
// auth-service puede usar Node.js + JWT
// product-service puede usar Node.js + Elasticsearch
// inventory-service puede usar Python + FastAPI
// iot-service puede usar Go + MQTT
```

## 🚀 Desarrollo

### Ejecutar Todos los Servicios
```bash
# Desde la raíz del proyecto
docker-compose up backend
```

### Ejecutar un Servicio Específico
```bash
# Solo auth service
cd 2-backend/auth-service
npm install
npm run dev

# Solo product service
cd 2-backend/product-service
npm install
npm run dev
```

### Testing de Servicios
```bash
# Test de un servicio específico
cd 2-backend/product-service
npm test

# Test de integración entre servicios
npm run test:integration
```

## 📋 APIs de Cada Servicio

### API Gateway (Puerto 3001)
- **Función**: Proxy y autenticación
- **Endpoints**: 
  - `GET /health` - Health check
  - `POST /auth/*` → redirige a auth-service
  - `GET /products/*` → redirige a product-service
  - `GET /inventory/*` → redirige a inventory-service
  - `POST /iot/*` → redirige a iot-service

### Auth Service (Puerto 3002)
- **Función**: Gestión de usuarios y autenticación
- **Endpoints**:
  - `POST /auth/login` - Iniciar sesión
  - `POST /auth/register` - Registrar usuario
  - `GET /auth/profile` - Perfil del usuario
  - `POST /auth/logout` - Cerrar sesión

### Product Service (Puerto 3003)
- **Función**: Gestión del catálogo de productos
- **Endpoints**:
  - `GET /products` - Lista de productos
  - `POST /products` - Crear producto
  - `GET /products/:id` - Detalles de producto
  - `PUT /products/:id` - Actualizar producto
  - `DELETE /products/:id` - Eliminar producto

### Inventory Service (Puerto 3004)
- **Función**: Control de stock e inventario
- **Endpoints**:
  - `GET /inventory` - Estado del inventario
  - `POST /inventory/move` - Registrar movimiento
  - `GET /inventory/alerts` - Alertas de stock
  - `POST /inventory/adjust` - Ajustar stock

### IoT Service (Puerto 3005)
- **Función**: Comunicación con dispositivos IoT
- **Endpoints**:
  - `GET /devices` - Lista de dispositivos
  - `POST /devices/scan` - Procesar escaneo NFC
  - `GET /events` - Eventos IoT
  - `POST /devices/command` - Enviar comando a dispositivo

## 🔧 Configuración

### Variables de Entorno
Cada servicio tiene su propio `.env`:

```bash
# auth-service/.env
PORT=3002
DATABASE_URL=postgres://user:pass@localhost/auth_db
JWT_SECRET=secret_key

# product-service/.env
PORT=3003
DATABASE_URL=postgres://user:pass@localhost/product_db
AUTH_SERVICE_URL=http://auth-service:3002

# etc...
```

### Base de Datos
Cada servicio puede tener su propia base de datos:
- **Auth Service**: Tabla de usuarios
- **Product Service**: Tabla de productos
- **Inventory Service**: Tabla de stock y movimientos
- **IoT Service**: Tabla de dispositivos y eventos

## 🧪 Testing

### Unit Tests
```bash
# Test de un controlador específico
cd 2-backend/product-service
npm test src/controllers/productController.test.js
```

### Integration Tests
```bash
# Test de comunicación entre servicios
npm run test:integration
```

### Contract Tests
```bash
# Verificar que los servicios mantienen sus contratos
npm run test:contract
```

## 💡 Tips para Principiantes

1. **Empieza por un servicio**: Concentrarte en product-service primero
2. **API Gateway es clave**: Es tu punto de entrada único
3. **Cada servicio es independiente**: Puede ejecutarse por separado
4. **Usa Docker Compose**: Orquesta todo automáticamente
5. **Logs son tu amigo**: Cada servicio logea sus operaciones
6. **Base de datos compartida**: Para simplificar, todos usan la misma BD

## 🔍 Debugging

### Ver logs de un servicio
```bash
docker-compose logs -f product-service
```

### Verificar comunicación entre servicios
```bash
# Desde auth-service, llamar a product-service
curl http://product-service:3000/products
```

### Health checks
```bash
curl http://localhost:3001/health  # API Gateway
curl http://localhost:3002/health  # Auth Service
curl http://localhost:3003/health  # Product Service
# etc...
```

---

**Recuerda**: Cada servicio es como una mini-aplicación independiente. Todos juntos forman el "backend" completo, pero cada uno tiene su responsabilidad específica.
