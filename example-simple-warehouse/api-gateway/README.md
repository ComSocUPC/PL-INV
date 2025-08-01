# � API Gateway - Punto de Entrada del Sistema

El **API Gateway** es el punto de entrada único para todas las peticiones al sistema de almacén. Actúa como un proxy inteligente que enruta las peticiones a los microservicios correspondientes.

## 📋 Índice
- [� Propósito](#-propósito)
- [🏗️ Arquitectura](#️-arquitectura)
- [� Inicio Rápido](#-inicio-rápido)
- [📡 Endpoints](#-endpoints)
- [� Configuración](#-configuración)
- [🧪 Testing](#-testing)
- [� Documentación OpenAPI](#-documentación-openapi)

## 🎯 Propósito

### **¿Qué hace el API Gateway?**
- **🔄 Enrutamiento**: Dirige peticiones a los servicios correspondientes
- **🔐 Autenticación**: Valida tokens JWT
- **📊 Rate Limiting**: Previene abuso de APIs
- **📝 Logging**: Registra todas las peticiones
- **📚 Documentación**: Centraliza la documentación de APIs
- **🛡️ Seguridad**: Aplica políticas de seguridad uniformes

### **¿Por qué usar un API Gateway?**
- **Punto único de entrada**: Los clientes solo necesitan conocer una URL
- **Simplificación**: Los clientes no necesitan saber dónde están los servicios
- **Seguridad centralizada**: Un lugar para aplicar autenticación y autorización
- **Monitoreo unificado**: Métricas y logs centralizados

## 🏗️ Arquitectura

### **Flujo de Peticiones:**
```
📱 Cliente
    ↓ HTTP Request
🚪 API Gateway (:3000)
    ↓ Proxy Request
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
🔐 Auth       📦 Products   🌐 IoT        📊 Otros
Service       Service       Service       Services
(:3001)       (:3002)       (:3003)       (:300X)
    ↓             ↓             ↓             ↓
📋 Response + JWT Response + WebSocket + Otros
```

### **Componentes Principales:**
- **Router**: Enruta peticiones basado en path
- **Auth Middleware**: Valida tokens JWT
- **Rate Limiter**: Controla frecuencia de peticiones
- **Logger**: Registra actividad
- **Error Handler**: Maneja errores de manera uniforme
AUTH_SERVICE_URL=http://auth-service:3001    # URL del Auth Service
PRODUCT_SERVICE_URL=http://product-service:3002  # URL del Product Service
IOT_SERVICE_URL=http://iot-service:3003      # URL del IoT Service
```

### 🚀 Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Endpoints Principales

### 🏥 Health Check
```http
GET /health
```
**Respuesta:**
```json
{
  "status": "up",
  "services": {
    "gateway": "up",
    "auth": "up",
    "products": "up",
    "iot": "up"
  }
}
```

### 📖 Documentación
```http
GET /docs
```
Muestra la documentación completa del sistema.

### 🔐 Autenticación (Proxy)
```http
POST /api/auth/login
POST /api/auth/register
```

### 📦 Productos (Proxy)
```http
GET /api/products
POST /api/products
```

### 🔌 IoT (Proxy)
```http
GET /api/iot/sensors/temperature
POST /api/iot/nfc-scan
```

## 🎓 Conceptos Educativos

### 1. **Proxy Pattern**
El Gateway actúa como un proxy - recibe peticiones y las reenvía:

```javascript
// Ejemplo simplificado de proxy
app.use('/api/products', async (req, res) => {
  // Reenviar petición al Product Service
  const response = await axios({
    method: req.method,
    url: `${PRODUCT_SERVICE_URL}${req.path}`,
    data: req.body
  });
  
  // Devolver respuesta al cliente
  res.json(response.data);
});
```

### 2. **Service Discovery**
El Gateway "conoce" dónde están todos los servicios:

```javascript
const SERVICES = {
  auth: 'http://auth-service:3001',
  products: 'http://product-service:3002',
  iot: 'http://iot-service:3003'
};
```

### 3. **Error Handling**
Maneja errores cuando los servicios no responden:

```javascript
try {
  const response = await axios.get(serviceUrl);
  res.json(response.data);
} catch (error) {
  res.status(500).json({
    error: 'Servicio no disponible'
  });
}
```

## 🔍 Observación en Tiempo Real

### 📊 Logs del Gateway
```bash
docker-compose logs -f api-gateway
```

Verás mensajes como:
```
🔐 Reenviando petición de auth: POST /login
📦 Reenviando petición de productos: GET /
🔌 Reenviando petición de IoT: GET /sensors/temperature
```

## 🧪 Experimentos Sugeridos

### 1. **Modificar Rutas**
Añade una nueva ruta en `index.js`:

```javascript
app.get('/api/warehouse/status', (req, res) => {
  res.json({
    message: '🏪 Almacén funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});
```

### 2. **Añadir Middleware**
Crea un middleware de logging:

```javascript
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});
```

### 3. **Simular Fallo de Servicio**
Para el Product Service y observa cómo reacciona el Gateway:

```bash
docker-compose stop product-service
curl http://localhost:3000/api/products
```

## 🎯 Siguiente Paso

Una vez que entiendas cómo funciona el API Gateway, puedes:

1. **Explorar el Auth Service** → Cómo se manejan usuarios y JWT
2. **Ver el Product Service** → CRUD básico con base de datos
3. **Probar el IoT Service** → Simulación de sensores

---

**💡 Recuerda**: El API Gateway es el "director de orquesta" - coordina todos los microservicios para crear una experiencia unificada para el cliente.
