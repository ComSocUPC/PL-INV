# 💾 Database - Capa de Datos

Esta carpeta contiene toda la persistencia de datos y sistemas de almacenamiento del proyecto.

## 📋 ¿Qué es esto?

En una arquitectura de 3 capas tradicional, tendrías **UNA** base de datos. Aquí mantenemos esa simplicidad pero organizamos los datos por dominio y agregamos sistemas especializados:

```
Base de Datos Tradicional          →      Almacenamiento Especializado
┌─────────────────────────────┐            ┌──────────────┐ ┌──────────────┐
│                             │            │  PostgreSQL  │ │    Redis     │
│  Una sola base de datos     │       →    │ (Datos prim.)│ │   (Cache)    │
│  con todas las tablas       │            └──────────────┘ └──────────────┘
│                             │            
└─────────────────────────────┘            ┌──────────────┐
                                           │  MQTT Broker │
                                           │  (Eventos)   │
                                           └──────────────┘
```

## 🏗️ Estructura

```
3-database/
│
├── 📁 postgres/                     # 🐘 Base de datos principal
│   ├── 📄 Dockerfile               # PostgreSQL configurado
│   ├── 📁 init/                    # Scripts de inicialización
│   │   ├── 📄 01-create-schemas.sql    # Crear esquemas por servicio
│   │   ├── 📄 02-create-tables.sql     # Todas las tablas
│   │   ├── 📄 03-sample-data.sql       # Datos de prueba
│   │   └── 📄 04-indexes.sql           # Índices para performance
│   ├── 📁 migrations/              # Migraciones de BD
│   │   ├── 📄 001_initial_schema.sql
│   │   ├── 📄 002_add_iot_tables.sql
│   │   └── 📄 003_add_indexes.sql
│   └── 📄 README.md
│
├── 📁 redis/                        # 🚀 Cache y sesiones
│   ├── 📄 Dockerfile
│   ├── 📄 redis.conf               # Configuración optimizada
│   └── 📄 README.md
│
├── 📁 mqtt/                         # 📡 Broker de mensajes para IoT
│   ├── 📄 Dockerfile
│   ├── 📄 mosquitto.conf          # Configuración MQTT
│   ├── 📁 auth/                   # Autenticación MQTT
│   └── 📄 README.md
│
└── 📄 README.md                     # Este archivo
```

## 🎯 Filosofía de Datos

### Principio: Una BD, Múltiples Esquemas

En lugar de múltiples bases de datos (complejo), usamos **una base de datos con esquemas separados**:

```sql
-- Base de datos: inventory_system
-- Esquemas por servicio:

├── auth_schema          -- Datos de usuarios y autenticación
│   ├── users
│   ├── roles
│   └── sessions
│
├── product_schema       -- Datos de productos
│   ├── products
│   ├── categories
│   └── product_images
│
├── inventory_schema     -- Datos de stock
│   ├── inventory
│   ├── movements
│   └── alerts
│
└── iot_schema          -- Datos de dispositivos IoT
    ├── devices
    ├── events
    └── device_configs
```

### Ventajas de Este Enfoque

✅ **Simplicidad**: Una sola conexión de BD para empezar
✅ **Transacciones**: Operaciones ACID entre esquemas
✅ **Migración fácil**: Después puedes separar por servicio
✅ **Desarrollo ágil**: No lidias con complejidad distribuida desde el inicio

## 🐘 PostgreSQL - Base de Datos Principal

### Esquema de Tablas

```sql
-- AUTH SCHEMA
CREATE SCHEMA IF NOT EXISTS auth_schema;

CREATE TABLE auth_schema.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT SCHEMA
CREATE SCHEMA IF NOT EXISTS product_schema;

CREATE TABLE product_schema.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true
);

CREATE TABLE product_schema.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES product_schema.categories(id),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    nfc_tag_id VARCHAR(255) UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY SCHEMA
CREATE SCHEMA IF NOT EXISTS inventory_schema;

CREATE TABLE inventory_schema.inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL, -- Referencia a product_schema.products
    location VARCHAR(255) NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_schema.movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'inbound', 'outbound', 'adjustment', 'transfer'
    quantity INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL,
    reason TEXT,
    reference VARCHAR(100),
    user_id INTEGER, -- Referencia a auth_schema.users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IOT SCHEMA
CREATE SCHEMA IF NOT EXISTS iot_schema;

CREATE TABLE iot_schema.devices (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'nfc_reader', 'weight_sensor', etc.
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline', -- 'online', 'offline', 'error'
    last_seen TIMESTAMP,
    firmware_version VARCHAR(50),
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE iot_schema.events (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) REFERENCES iot_schema.devices(id),
    event_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Conexión desde Servicios

```javascript
// Cada servicio usa su esquema específico
// auth-service
const authPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  searchPath: ['auth_schema', 'public']
});

// product-service  
const productPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  searchPath: ['product_schema', 'public']
});

// inventory-service
const inventoryPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  searchPath: ['inventory_schema', 'product_schema', 'public']
});
```

## 🚀 Redis - Cache y Sesiones

### Uso por Servicio

```javascript
// Cache de productos (product-service)
const cacheProduct = async (productId, product) => {
  await redis.setex(`product:${productId}`, 3600, JSON.stringify(product));
};

// Sesiones de usuario (auth-service)
const storeSession = async (userId, sessionData) => {
  await redis.setex(`session:${userId}`, 86400, JSON.stringify(sessionData));
};

// Rate limiting (api-gateway)
const checkRateLimit = async (ip) => {
  const key = `rate_limit:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 60); // 1 minuto
  }
  return current <= 100; // 100 requests por minuto
};

// Cache de inventario (inventory-service)
const cacheInventoryStatus = async (productId, status) => {
  await redis.setex(`inventory:${productId}`, 300, JSON.stringify(status));
};
```

### Configuración Redis

```conf
# redis.conf
# Configuración optimizada para desarrollo

# Memoria
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistencia (para desarrollo)
save 900 1
save 300 10
save 60 10000

# Seguridad básica
requirepass redis_password_change_in_production

# Logging
loglevel notice
logfile /var/log/redis/redis.log
```

## 📡 MQTT Broker - Eventos IoT

### Topics Organizados

```
inventory-system/
├── devices/
│   ├── nfc-reader-001/
│   │   ├── status           # Estado del dispositivo
│   │   ├── data             # Datos del dispositivo
│   │   └── commands         # Comandos al dispositivo
│   └── weight-sensor-001/
│       ├── status
│       ├── data
│       └── commands
├── inventory/
│   ├── stock/updated        # Stock actualizado
│   ├── alerts/low-stock     # Alertas de stock bajo
│   └── movements/created    # Nuevos movimientos
└── system/
    ├── errors              # Errores del sistema
    └── health              # Health checks
```

### Configuración MQTT

```conf
# mosquitto.conf
# Puerto estándar
port 1883

# Permitir conexiones anónimas para desarrollo
allow_anonymous true

# En producción, habilitar autenticación
# password_file /mosquitto/config/passwords

# Logs
log_dest file /mosquitto/log/mosquitto.log
log_type all

# Persistencia
persistence true
persistence_location /mosquitto/data/

# Websockets para frontend
listener 9001
protocol websockets
```

### Uso desde Servicios

```javascript
// iot-service: Publicar evento
mqtt.publish('inventory-system/devices/nfc-reader-001/data', JSON.stringify({
  tag_id: 'NFC123456789',
  timestamp: new Date().toISOString(),
  signal_strength: -45
}));

// inventory-service: Escuchar eventos
mqtt.subscribe('inventory-system/devices/+/data');
mqtt.on('message', (topic, message) => {
  const deviceId = topic.split('/')[2];
  const data = JSON.parse(message.toString());
  processDeviceData(deviceId, data);
});
```

## 🔧 Configuración y Desarrollo

### Inicialización Automática

```bash
# Al ejecutar docker-compose up
# 1. Se crean las bases de datos
# 2. Se ejecutan los scripts de init/
# 3. Se cargan datos de prueba
# 4. Se configuran Redis y MQTT
```

### Variables de Entorno

```env
# PostgreSQL
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=strong_password
POSTGRES_DB=inventory_system

# Redis
REDIS_PASSWORD=redis_password

# MQTT
MQTT_USERNAME=mqtt_user
MQTT_PASSWORD=mqtt_password
```

### Backup y Restore

```bash
# Backup
docker-compose exec postgres pg_dump -U inventory_user inventory_system > backup.sql

# Restore
docker-compose exec -T postgres psql -U inventory_user inventory_system < backup.sql
```

## 🧪 Testing de Base de Datos

### Test Database

```sql
-- Crear BD de testing
CREATE DATABASE inventory_system_test;

-- Usar los mismos esquemas pero con datos de prueba
```

### Datos de Prueba

```sql
-- 03-sample-data.sql
INSERT INTO auth_schema.users (email, password_hash, first_name, last_name, role)
VALUES 
  ('admin@example.com', '$2b$10$hash...', 'Admin', 'User', 'admin'),
  ('user@example.com', '$2b$10$hash...', 'Regular', 'User', 'user');

INSERT INTO product_schema.categories (name, description)
VALUES 
  ('Electronics', 'Electronic devices and components'),
  ('Office', 'Office supplies and equipment');

INSERT INTO product_schema.products (name, sku, category_id, price, nfc_tag_id)
VALUES 
  ('Laptop Dell XPS 13', 'DELL-XPS13-001', 1, 1299.99, 'NFC123456789'),
  ('Wireless Mouse', 'MOUSE-LOGITECH-001', 1, 29.99, 'NFC987654321');
```

## 📊 Monitoreo

### Health Checks

```sql
-- Verificar conexiones activas
SELECT count(*) FROM pg_stat_activity;

-- Verificar tamaño de tablas
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables WHERE schemaname NOT IN ('information_schema', 'pg_catalog');

-- Verificar índices más usados
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 💡 Tips para Principiantes

1. **Empieza simple**: Una BD, múltiples esquemas
2. **Usa migraciones**: Nunca cambies BD directamente
3. **Indices son importantes**: Para queries frecuentes
4. **Redis es temporal**: No guardes datos críticos solo en Redis
5. **MQTT es asíncrono**: No esperes respuestas inmediatas
6. **Backup regular**: Especialmente en producción

## 🔄 Migración a Microservicios Completos

Cuando tu proyecto crezca, puedes migrar a BDs separadas:

```
Una BD Compartida              →      BDs por Servicio
┌─────────────────────────┐           ┌─────────┐ ┌─────────┐ ┌─────────┐
│  inventory_system       │      →    │ auth_db │ │prod_db  │ │inv_db   │
│  ├── auth_schema        │           │         │ │         │ │         │
│  ├── product_schema     │           │         │ │         │ │         │
│  ├── inventory_schema   │           │         │ │         │ │         │
│  └── iot_schema         │           │         │ │         │ │         │
└─────────────────────────┘           └─────────┘ └─────────┘ └─────────┘
```

Pero por ahora, la simplicidad es tu amiga.

---

**Recuerda**: Los datos son el corazón de tu aplicación. Mantén esta capa simple y confiable mientras exploras la complejidad de los microservicios en las capas superiores.
