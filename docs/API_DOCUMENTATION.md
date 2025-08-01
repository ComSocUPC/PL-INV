# API Documentation - Sistema de Inventario

## Descripción General

Esta documentación describe las APIs REST disponibles en el sistema de inventario con microservicios. Todas las APIs (excepto autenticación) requieren un token JWT válido.

## Autenticación

### Base URL
```
http://localhost:3000/api/auth
```

### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "operator"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "operator",
    "active": true
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "operator"
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Perfil de Usuario
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

## Gestión de Productos

### Base URL
```
http://localhost:3000/api/products
```

### Listar Productos
```http
GET /api/products?page=1&limit=10&search=laptop&category=electronics
Authorization: Bearer {token}
```

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda por nombre o SKU
- `category`: Filtrar por categoría
- `active`: true/false

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "sku": "LAPTOP-001",
      "name": "Laptop Dell Inspiron 15",
      "description": "Laptop para oficina con Windows 11",
      "category": {
        "id": "uuid",
        "name": "Electrónicos"
      },
      "unitPrice": 899.99,
      "costPrice": 650.00,
      "minimumStock": 5,
      "reorderPoint": 10,
      "barcode": "1234567890123",
      "nfcId": "NFC001",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Crear Producto
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "sku": "LAPTOP-002",
  "name": "Laptop HP Pavilion",
  "description": "Laptop gaming con GTX 1650",
  "categoryId": "uuid",
  "unitPrice": 1299.99,
  "costPrice": 950.00,
  "minimumStock": 3,
  "reorderPoint": 8,
  "barcode": "2345678901234",
  "nfcId": "NFC011",
  "specifications": {
    "processor": "Intel i5",
    "ram": "8GB",
    "storage": "512GB SSD"
  }
}
```

### Obtener Producto por ID
```http
GET /api/products/{id}
Authorization: Bearer {token}
```

### Actualizar Producto
```http
PUT /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Laptop HP Pavilion Gaming",
  "unitPrice": 1199.99,
  "specifications": {
    "processor": "Intel i5",
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}
```

### Eliminar Producto
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

## Gestión de Inventario

### Base URL
```
http://localhost:3000/api/inventory
```

### Consultar Inventario
```http
GET /api/inventory?location=MAIN-01&lowStock=true&page=1&limit=10
Authorization: Bearer {token}
```

**Parámetros de consulta:**
- `location`: Filtrar por ubicación
- `lowStock`: true para mostrar solo productos con stock bajo
- `product`: Filtrar por ID de producto
- `page`, `limit`: Paginación

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "sku": "LAPTOP-001",
        "name": "Laptop Dell Inspiron 15"
      },
      "location": {
        "id": "uuid",
        "name": "Almacén Principal",
        "code": "MAIN-01"
      },
      "quantity": 15,
      "reservedQuantity": 2,
      "availableQuantity": 13,
      "lastCountedAt": "2024-01-15T10:30:00Z",
      "isLowStock": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Registrar Movimiento de Inventario
```http
POST /api/inventory/movement
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "uuid",
  "locationId": "uuid",
  "movementType": "in",
  "quantity": 10,
  "reason": "Recepción de nuevo stock",
  "referenceNumber": "PO-2024-001",
  "notes": "Producto en perfecto estado"
}
```

**Tipos de movimiento:**
- `in`: Entrada de stock
- `out`: Salida de stock
- `transfer`: Transferencia entre ubicaciones
- `adjustment`: Ajuste de inventario
- `count`: Conteo físico

### Historial de Movimientos
```http
GET /api/inventory/movements?productId=uuid&days=30&type=in
Authorization: Bearer {token}
```

### Reportes de Inventario
```http
GET /api/inventory/reports/stock-levels
Authorization: Bearer {token}
```

```http
GET /api/inventory/reports/movements?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}
```

```http
GET /api/inventory/reports/low-stock
Authorization: Bearer {token}
```

## Gateway IoT

### Base URL
```
http://localhost:3000/api/iot
```

### Procesar Lectura NFC
```http
POST /api/iot/nfc-scan
Authorization: Bearer {token}
Content-Type: application/json

{
  "nfcId": "NFC001",
  "deviceId": "NFC-READER-001",
  "location": "MAIN-WAREHOUSE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Respuesta:**
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "sku": "LAPTOP-001",
    "name": "Laptop Dell Inspiron 15"
  },
  "inventory": {
    "quantity": 15,
    "location": "Almacén Principal"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Obtener Dispositivos IoT
```http
GET /api/iot/devices?type=nfc_reader&status=active
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "deviceId": "NFC-READER-001",
      "deviceType": "nfc_reader",
      "name": "Lector NFC Entrada Principal",
      "status": "active",
      "lastSeen": "2024-01-15T10:25:00Z",
      "location": {
        "id": "uuid",
        "name": "Entrada Principal"
      },
      "configuration": {
        "readRange": "5cm",
        "frequency": "13.56MHz"
      }
    }
  ]
}
```

### Datos de Sensores
```http
GET /api/iot/sensor-data?deviceId=TEMP-SENSOR-001&hours=24
Authorization: Bearer {token}
```

```http
POST /api/iot/sensor-data
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceId": "TEMP-SENSOR-001",
  "sensorType": "temperature",
  "value": 22.5,
  "unit": "celsius",
  "locationId": "uuid",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Alertas IoT
```http
GET /api/iot/alerts?severity=critical&resolved=false
Authorization: Bearer {token}
```

```http
PUT /api/iot/alerts/{id}/resolve
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolvedBy": "uuid",
  "resolution": "Temperatura normalizada, sensor recalibrado"
}
```

## Categorías

### Base URL
```
http://localhost:3000/api/categories
```

### Listar Categorías
```http
GET /api/categories
Authorization: Bearer {token}
```

### Crear Categoría
```http
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Electrónicos Portátiles",
  "description": "Dispositivos electrónicos portátiles",
  "parentId": "uuid"
}
```

## Códigos de Estado HTTP

- `200`: OK - Solicitud exitosa
- `201`: Created - Recurso creado exitosamente
- `204`: No Content - Operación exitosa sin contenido
- `400`: Bad Request - Datos inválidos
- `401`: Unauthorized - Token inválido o expirado
- `403`: Forbidden - Sin permisos suficientes
- `404`: Not Found - Recurso no encontrado
- `409`: Conflict - Conflicto con estado actual
- `422`: Unprocessable Entity - Error de validación
- `429`: Too Many Requests - Límite de velocidad excedido
- `500`: Internal Server Error - Error interno del servidor
- `503`: Service Unavailable - Servicio no disponible

## Autenticación y Autorización

### Headers Requeridos
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Roles y Permisos

**Admin**
- Acceso completo a todas las APIs
- Gestión de usuarios
- Configuración del sistema

**Manager**
- Lectura/escritura de productos e inventario
- Lectura de reportes
- Gestión de ubicaciones

**Operator**
- Lectura/escritura de productos e inventario
- Registro de movimientos
- Consulta de datos IoT

**Viewer**
- Solo lectura de productos e inventario
- Consulta de reportes

### Rate Limiting

- **API Gateway**: 100 requests/15 minutos por IP
- **Auth Service**: 5 requests/15 minutos por IP (solo endpoints de auth)
- **Otros servicios**: 200 requests/15 minutos por IP

### Paginación

Todos los endpoints que retornan listas soportan paginación:

```
?page=1&limit=10
```

Respuesta incluye metadatos de paginación:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## WebSocket API

### Conexión
```javascript
const ws = new WebSocket('ws://localhost:3004');
```

### Suscripción a Eventos
```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  topics: ['inventory/nfc/scan', 'inventory/alerts/critical']
}));
```

### Eventos Disponibles
- `inventory/nfc/scan`: Lecturas NFC en tiempo real
- `inventory/alerts/*`: Alertas del sistema
- `inventory/sensors/*`: Datos de sensores
- `inventory/movements`: Movimientos de inventario

## Ejemplos de Uso

### Cliente JavaScript
```javascript
const API_BASE = 'http://localhost:3000/api';
let authToken = '';

// Login
async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  authToken = data.token;
  return data;
}

// Obtener productos
async function getProducts(page = 1, limit = 10) {
  const response = await fetch(`${API_BASE}/products?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
}

// Crear producto
async function createProduct(productData) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(productData)
  });
  
  return response.json();
}
```

### Cliente Python
```python
import requests
import json

class InventoryAPI:
    def __init__(self, base_url='http://localhost:3000/api'):
        self.base_url = base_url
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f'{self.base_url}/auth/login', json={
            'email': email,
            'password': password
        })
        data = response.json()
        self.token = data['token']
        return data
    
    def get_headers(self):
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def get_products(self, page=1, limit=10):
        response = requests.get(
            f'{self.base_url}/products',
            params={'page': page, 'limit': limit},
            headers=self.get_headers()
        )
        return response.json()
    
    def create_movement(self, movement_data):
        response = requests.post(
            f'{self.base_url}/inventory/movement',
            json=movement_data,
            headers=self.get_headers()
        )
        return response.json()

# Uso
api = InventoryAPI()
api.login('operator@inventory.com', 'password123')
products = api.get_products()
```

Esta documentación proporciona una guía completa para interactuar con todas las APIs del sistema de inventario. Para más detalles específicos, consulta los endpoints individuales o contacta al equipo de desarrollo.
