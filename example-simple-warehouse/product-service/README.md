# 🛍️ Servicio de Productos - Product Service

Este servicio maneja el catálogo completo de productos del almacén, incluyendo CRUD, búsquedas, gestión de stock y categorización.

## 🎯 Propósito Didáctico

Este servicio demuestra cómo:
- ✅ Implementar CRUD completo (Create, Read, Update, Delete)
- ✅ Manejar validaciones robustas con Joi
- ✅ Implementar búsqueda y filtros avanzados
- ✅ Gestionar paginación para grandes volúmenes
- ✅ Documentar APIs con OpenAPI/Swagger
- ✅ Manejar base de datos SQLite con índices
- ✅ Implementar alertas de stock bajo

## 🚀 Funcionalidades

### Endpoints Principales:

#### 📋 Gestión de Productos:
- `GET /api/products` - Lista productos (con paginación y filtros)
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/code/:code` - Obtener producto por código único
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto completo
- `DELETE /api/products/:id` - Eliminar producto (soft/hard delete)

#### 🔍 Búsqueda y Filtros:
- `GET /api/products/search/:query` - Búsqueda por texto
- `GET /api/products/category/:category` - Filtrar por categoría

#### 📦 Gestión de Stock:
- `PATCH /api/products/:id/stock` - Actualizar stock específico
- Alertas automáticas de stock bajo

#### 📊 Estadísticas:
- `GET /api/products/stats/summary` - Estadísticas generales
- `GET /health` - Estado del servicio

## 📊 Datos de Ejemplo

El servicio crea automáticamente productos de muestra:

| Código | Nombre | Categoría | Precio | Stock |
|--------|--------|-----------|--------|-------|
| LAP-DELL-001 | Laptop Dell Inspiron 15 | Electrónicos | $899.99 | 15 |
| SIL-ERG-001 | Silla de Oficina Ergonómica | Mobiliario | $159.99 | 25 |
| PAP-A4-500 | Papel Bond A4 | Papelería | $4.50 | 100 |
| MON-LED-24 | Monitor LED 24 pulgadas | Electrónicos | $189.99 | 8 |
| CAF-PREM-1K | Café Premium 1kg | Alimentos | $12.99 | 50 |

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar el servicio
npm start

# Ejecutar en modo desarrollo
npm run dev
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t product-service .

# Ejecutar contenedor
docker run -p 3002:3002 product-service
```

## 🧪 Ejemplos de Uso

### Crear un producto:
```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teclado Mecánico RGB",
    "description": "Teclado mecánico con retroiluminación RGB",
    "code": "TEC-MECA-001",
    "category": "Electrónicos",
    "price": 89.99,
    "stock": 20,
    "min_stock": 5,
    "unit": "unidad"
  }'
```

### Buscar productos:
```bash
# Buscar por texto
curl http://localhost:3002/api/products/search/laptop

# Filtrar por categoría
curl http://localhost:3002/api/products/category/Electrónicos

# Lista con paginación
curl "http://localhost:3002/api/products?page=1&limit=5&sort=price&order=desc"
```

### Actualizar stock:
```bash
curl -X PATCH http://localhost:3002/api/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"stock": 50}'
```

### Obtener estadísticas:
```bash
curl http://localhost:3002/api/products/stats/summary
```

## 📋 Estructura de Archivos

```
product-service/
├── index.js          # Servidor principal con todos los endpoints
├── database.js       # Operaciones SQLite y funciones CRUD
├── package.json      # Dependencias y scripts
├── Dockerfile        # Configuración para Docker
└── README.md         # Esta documentación
```

## 🔧 Configuración

### Variables de Entorno:
```env
PORT=3002                    # Puerto del servicio
NODE_ENV=development         # Entorno de ejecución
```

### Parámetros de Consulta Soportados:

#### Para `/api/products`:
- `page` (número): Página actual (default: 1)
- `limit` (número): Productos por página (1-100, default: 10)
- `category` (string): Filtrar por categoría
- `active` (boolean): Productos activos/inactivos (default: true)
- `sort` (string): Campo de ordenamiento (name, price, stock, etc.)
- `order` (string): Dirección del orden (asc, desc)

## 📊 Características Avanzadas

### Validaciones con Joi:
- Nombres: 2-100 caracteres
- Códigos: únicos, 3-20 caracteres
- Precios: números positivos
- Stock: enteros no negativos
- Categorías: 2-50 caracteres
- Unidades: enum predefinido

### Base de Datos:
- **SQLite** para simplicidad
- **Índices** en campos frecuentemente consultados
- **Soft delete** (marcado como inactivo)
- **Timestamps** automáticos

### Búsqueda:
- Búsqueda por texto en nombre, descripción y código
- Filtros por categoría
- Ordenamiento múltiple
- Paginación eficiente

### Alertas:
- Stock bajo cuando ≤ stock mínimo
- Validación de códigos únicos
- Respuestas de error descriptivas

## 🔗 Integración

Este servicio se conecta con:
- **API Gateway** (puerto 3000): Recibe peticiones enrutadas
- **IoT Service** (puerto 3003): Para lecturas NFC de productos
- **Auth Service** (puerto 3001): Para validación de tokens (en implementación completa)

## 📖 Documentación de la API

Una vez ejecutándose, ver documentación en:
- http://localhost:3002/api-docs (Swagger UI)

## 📚 Conceptos Aprendidos

Al estudiar este servicio aprenderás sobre:

1. **CRUD Completo**: Operaciones Create, Read, Update, Delete
2. **Validación de Datos**: Usando Joi para validaciones robustas
3. **Base de Datos**: SQLite con índices y consultas optimizadas
4. **Búsqueda**: Implementación de búsqueda por texto y filtros
5. **Paginación**: Manejo eficiente de grandes volúmenes de datos
6. **API REST**: Diseño de endpoints RESTful
7. **Documentación**: OpenAPI/Swagger para documentar APIs
8. **Manejo de Errores**: Respuestas HTTP apropiadas
9. **Stock Management**: Gestión de inventario con alertas
10. **Docker**: Containerización de microservicios

¡Excelente ejemplo para entender la gestión completa de productos en un sistema de inventario! 🎓
