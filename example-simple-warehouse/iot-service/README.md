# 🌐 Servicio IoT - IoT Service

Este servicio maneja todos los dispositivos IoT del almacén, incluyendo lectores NFC, sensores ambientales, sistema de alertas y comunicación en tiempo real.

## 🎯 Propósito Didáctico

Este servicio demuestra cómo:
- ✅ Integrar dispositivos IoT en microservicios
- ✅ Manejar protocolos de comunicación (WebSockets, MQTT simulado)
- ✅ Implementar sistemas de alertas inteligentes
- ✅ Procesar lecturas NFC para identificación
- ✅ Monitorear sensores ambientales en tiempo real
- ✅ Crear simuladores para desarrollo sin hardware
- ✅ Gestionar time series de datos IoT

## 🚀 Funcionalidades

### 📱 Gestión de Dispositivos:
- `GET /api/devices` - Lista dispositivos IoT registrados
- `POST /api/devices` - Registrar nuevo dispositivo
- `GET /api/devices/:id` - Obtener dispositivo específico

### 🔍 Lecturas NFC:
- `POST /api/nfc/reading` - Procesar lectura NFC real
- `POST /api/simulate/nfc` - Simular lectura NFC para desarrollo

### 🌡️ Sensores Ambientales:
- `POST /api/sensors/reading` - Procesar lectura de sensor
- `POST /api/simulate/sensor` - Simular lectura de sensor
- Tipos soportados: temperatura, humedad, movimiento, luz

### 🚨 Sistema de Alertas:
- `GET /api/alerts` - Obtener alertas del sistema
- `PATCH /api/alerts/:id/read` - Marcar alerta como leída
- Severidades: info, warning, critical, error

### 📊 Monitoreo y Estadísticas:
- `GET /api/readings` - Historial de lecturas
- `GET /api/stats` - Estadísticas completas del sistema
- `GET /health` - Estado del servicio

### 🔄 Tiempo Real:
- **WebSocket**: `ws://localhost:3003/ws`
- Notificaciones instantáneas de lecturas y alertas
- Estado online/offline de dispositivos

## 📊 Dispositivos de Ejemplo

El servicio crea automáticamente dispositivos de muestra:

| Device ID | Nombre | Tipo | Ubicación |
|-----------|--------|------|-----------|
| NFC-ENTRANCE-001 | Lector NFC Entrada | nfc_reader | Entrada Principal |
| NFC-STORAGE-001 | Lector NFC Almacén | nfc_reader | Área de Almacenamiento |
| TEMP-COLD-001 | Sensor Temperatura | temperature_sensor | Área Refrigerada |
| HUM-MAIN-001 | Sensor Humedad | humidity_sensor | Depósito General |
| TEMP-OFFICE-001 | Sensor Temperatura | temperature_sensor | Área de Oficinas |

## 🎮 Códigos NFC Simulados

Para pruebas y desarrollo, el sistema incluye códigos NFC predefinidos:

```
LAP-DELL-001    → Laptop Dell Inspiron 15
SIL-ERG-001     → Silla de Oficina Ergonómica  
PAP-A4-500      → Papel Bond A4 (500 hojas)
MON-LED-24      → Monitor LED 24 pulgadas
CAF-PREM-1K     → Café Premium 1kg
TEC-MECA-001    → Teclado Mecánico RGB
MOU-OPT-001     → Mouse Óptico Inalámbrico
USB-32GB-001    → USB Flash Drive 32GB
CAB-HDMI-2M     → Cable HDMI 2 metros
AUR-BT-PRO      → Auriculares Bluetooth Pro
```

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
docker build -t iot-service .

# Ejecutar contenedor
docker run -p 3003:3003 iot-service
```

## 🧪 Ejemplos de Uso

### Registrar dispositivo IoT:
```bash
curl -X POST http://localhost:3003/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sensor Temperatura Nuevo",
    "type": "temperature_sensor",
    "device_id": "TEMP-NEW-001",
    "location": "Sala de Servidores",
    "configuration": {
      "min_temp": 16,
      "max_temp": 24,
      "alert_threshold": 2
    }
  }'
```

### Simular lectura NFC:
```bash
curl -X POST http://localhost:3003/api/simulate/nfc \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "NFC-ENTRANCE-001"
  }'
```

### Simular sensor de temperatura:
```bash
curl -X POST http://localhost:3003/api/simulate/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "TEMP-COLD-001",
    "sensor_type": "temperature"
  }'
```

### Procesar lectura NFC real:
```bash
curl -X POST http://localhost:3003/api/nfc/reading \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "NFC-ENTRANCE-001",
    "nfc_code": "LAP-DELL-001",
    "user_id": "admin"
  }'
```

### Obtener alertas recientes:
```bash
curl "http://localhost:3003/api/alerts?read=false&limit=10"
```

## 📋 Estructura de Archivos

```
iot-service/
├── index.js              # Servidor principal con APIs y WebSocket
├── database.js           # Gestión SQLite para dispositivos y lecturas
├── iot-simulator.js      # Simuladores de dispositivos IoT
├── package.json          # Dependencias incluyendo WebSockets
├── Dockerfile            # Configuración para Docker
└── README.md             # Esta documentación
```

## 🔧 Configuración

### Variables de Entorno:
```env
PORT=3003                    # Puerto del servicio
NODE_ENV=development         # Entorno de ejecución
```

### Umbrales de Alertas:
```javascript
temperature: {
  low: 15°C,      high: 30°C
  critical_low: 10°C,  critical_high: 35°C
}

humidity: {
  low: 30%,       high: 70%
  critical_low: 20%,   critical_high: 80%
}
```

## 🌐 WebSocket API

Conectar al WebSocket para recibir eventos en tiempo real:

```javascript
const ws = new WebSocket('ws://localhost:3003/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'nfc_reading':
      console.log('📱 Nueva lectura NFC:', data.data);
      break;
    case 'sensor_reading':
      console.log('🌡️ Nueva lectura sensor:', data.data);
      break;
    case 'alert':
      console.log('🚨 Nueva alerta:', data.data);
      break;
    case 'device_registered':
      console.log('📱 Dispositivo registrado:', data.data);
      break;
  }
};
```

## 🚨 Sistema de Alertas

### Tipos de Alertas:
- **info**: Información general
- **warning**: Advertencia (fuera de rango normal)
- **critical**: Crítica (fuera de rango seguro)
- **error**: Error del sistema

### Alertas Automáticas:
- Temperatura muy baja/alta
- Humedad muy baja/alta
- Dispositivos desconectados
- Errores de comunicación

## ⏰ Tareas Automáticas

El servicio ejecuta tareas programadas:
- **Cada 5 minutos**: Simulación automática de sensores
- **Limpieza de datos**: Elimina lecturas antiguas (futuro)
- **Health checks**: Verifica estado de dispositivos

## 🔗 Integración

Este servicio se conecta con:
- **API Gateway** (puerto 3000): Recibe peticiones enrutadas
- **Product Service** (puerto 3002): Valida códigos NFC contra productos
- **Auth Service** (puerto 3001): Para autenticación de usuarios (futuro)

## 📖 Documentación de la API

Una vez ejecutándose, ver documentación en:
- http://localhost:3003/api-docs (Swagger UI)

## 📚 Conceptos Aprendidos

Al estudiar este servicio aprenderás sobre:

1. **IoT Integration**: Cómo integrar dispositivos físicos
2. **NFC Technology**: Funcionamiento de lectores NFC
3. **Sensor Networks**: Redes de sensores ambientales
4. **WebSockets**: Comunicación bidireccional en tiempo real
5. **MQTT Protocol**: Protocolo de mensajería IoT (simulado)
6. **Time Series Data**: Almacenamiento de datos temporales
7. **Alert Systems**: Sistemas de alertas automáticas
8. **Device Management**: Gestión de dispositivos IoT
9. **Data Simulation**: Simulación de datos para desarrollo
10. **Real-time Monitoring**: Monitoreo en tiempo real

## 🎯 Casos de Uso Reales

### Escenarios del Almacén:
1. **Control de Acceso**: NFC para identificar personal y productos
2. **Monitoreo Ambiental**: Temperatura/humedad de áreas sensibles
3. **Seguridad**: Detectores de movimiento en áreas restringidas
4. **Automatización**: Luces automáticas basadas en sensores
5. **Inventario Inteligente**: Tracking automático de productos

¡Perfecto para entender la revolución IoT en almacenes modernos! 🎓
