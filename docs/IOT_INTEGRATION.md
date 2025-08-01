# Integración IoT - Guía de Implementación

## Descripción General

El sistema de inventario incluye un Gateway IoT completo que soporta múltiples tipos de dispositivos para automatizar el seguimiento y control del inventario.

## Dispositivos Soportados

### 1. Lectores NFC (Near Field Communication)

#### Características
- **Frecuencia**: 13.56 MHz
- **Rango**: 5cm aproximadamente
- **Protocolo**: ISO 14443 Type A/B
- **Velocidad**: 106, 212, 424 kbps

#### Casos de Uso
- Identificación rápida de productos
- Control de acceso a almacenes
- Seguimiento de movimientos de inventario
- Autenticación de personal

#### Configuración
```json
{
  "device_type": "nfc_reader",
  "configuration": {
    "read_range": "5cm",
    "frequency": "13.56MHz",
    "auto_scan": true,
    "scan_interval": 1000
  }
}
```

#### Datos MQTT
```json
{
  "topic": "inventory/nfc/scan",
  "payload": {
    "nfc_id": "NFC001",
    "device_id": "NFC-READER-001",
    "timestamp": "2024-01-15T10:30:00Z",
    "location": "MAIN-WAREHOUSE",
    "signal_strength": -45,
    "read_count": 1
  }
}
```

### 2. Sensores de Temperatura

#### Características
- **Rango**: -40°C a 85°C
- **Precisión**: ±0.5°C
- **Resolución**: 0.1°C
- **Comunicación**: I2C, SPI, 1-Wire

#### Casos de Uso
- Monitoreo de condiciones de almacenamiento
- Alertas de temperatura crítica
- Control de calidad de productos sensibles
- Cumplimiento de normativas

#### Configuración
```json
{
  "device_type": "temperature_sensor",
  "configuration": {
    "unit": "celsius",
    "range": "-40 to 85",
    "precision": 0.5,
    "sampling_rate": 60
  }
}
```

#### Datos MQTT
```json
{
  "topic": "inventory/sensors/temperature",
  "payload": {
    "device_id": "TEMP-SENSOR-001",
    "value": 22.5,
    "unit": "celsius",
    "location_id": "MAIN-01",
    "timestamp": "2024-01-15T10:30:00Z",
    "battery_level": 85
  }
}
```

### 3. Sensores de Movimiento/Presencia

#### Características
- **Tecnología**: PIR (Infrarrojo Pasivo)
- **Rango**: 10 metros
- **Ángulo**: 120°
- **Tiempo de respuesta**: < 1 segundo

#### Casos de Uso
- Detección de acceso no autorizado
- Seguimiento de actividad en almacenes
- Activación automática de iluminación
- Registro de patrones de uso

#### Configuración
```json
{
  "device_type": "motion_sensor",
  "configuration": {
    "detection_range": "10m",
    "angle": "120°",
    "sensitivity": "medium",
    "hold_time": 30
  }
}
```

#### Datos MQTT
```json
{
  "topic": "inventory/sensors/motion",
  "payload": {
    "device_id": "MOTION-SENSOR-001",
    "motion_detected": true,
    "confidence": 95,
    "location_id": "ENTRANCE-01",
    "timestamp": "2024-01-15T10:30:00Z",
    "duration": 5
  }
}
```

### 4. Sensores de Humedad

#### Características
- **Rango**: 0% a 100% RH
- **Precisión**: ±2% RH
- **Tiempo de respuesta**: 8 segundos

#### Casos de Uso
- Control de condiciones de almacenamiento
- Prevención de daños por humedad
- Monitoreo de productos sensibles
- Alertas de humedad excesiva/insuficiente

#### Configuración
```json
{
  "device_type": "humidity_sensor",
  "configuration": {
    "unit": "percent",
    "range": "0 to 100",
    "precision": 2,
    "sampling_rate": 300
  }
}
```

## Protocolos de Comunicación

### MQTT Topics Structure

```
inventory/
├── nfc/
│   ├── scan              # Lecturas NFC
│   └── status            # Estado de lectores
├── sensors/
│   ├── temperature       # Datos de temperatura
│   ├── humidity          # Datos de humedad
│   ├── motion           # Detección de movimiento
│   └── pressure         # Datos de presión (opcional)
├── devices/
│   ├── status           # Estado de dispositivos
│   ├── config           # Configuración de dispositivos
│   └── heartbeat        # Señales de vida
└── alerts/              # Alertas del sistema
    ├── critical
    ├── warning
    └── info
```

### WebSocket API

El sistema también soporta comunicación en tiempo real vía WebSocket:

```javascript
// Conexión WebSocket
const ws = new WebSocket('ws://localhost:3004');

// Suscribirse a topics específicos
ws.send(JSON.stringify({
  type: 'subscribe',
  topics: ['inventory/nfc/scan', 'inventory/alerts/*']
}));

// Manejar mensajes
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Mensaje recibido:', data);
};
```

## Configuración de Dispositivos

### Registro de Nuevo Dispositivo

```bash
# Registrar dispositivo vía API
curl -X POST http://localhost:3004/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "device_id": "NFC-READER-003",
    "device_type": "nfc_reader",
    "name": "Lector NFC Entrada Secundaria",
    "location_id": "SEC-ENTRANCE",
    "configuration": {
      "read_range": "5cm",
      "frequency": "13.56MHz",
      "auto_scan": true
    }
  }'
```

### Actualización de Configuración

```bash
# Actualizar configuración de dispositivo
curl -X PUT http://localhost:3004/api/devices/NFC-READER-003 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "configuration": {
      "read_range": "8cm",
      "sensitivity": "high"
    }
  }'
```

## Alertas y Monitoreo

### Tipos de Alertas

1. **Críticas**
   - Falla de dispositivo
   - Temperatura fuera de rango crítico
   - Acceso no autorizado

2. **Advertencias**
   - Batería baja
   - Dispositivo sin comunicación
   - Valores fuera de rango normal

3. **Informativas**
   - Dispositivo en línea
   - Configuración actualizada
   - Mantenimiento programado

### Configuración de Alertas

```json
{
  "alert_rules": {
    "temperature": {
      "min_value": 15,
      "max_value": 25,
      "critical_min": 10,
      "critical_max": 30
    },
    "humidity": {
      "min_value": 40,
      "max_value": 70,
      "critical_min": 30,
      "critical_max": 80
    },
    "device_offline_timeout": 300
  }
}
```

## Ejemplos de Integración

### Cliente Python para Sensores

```python
import paho.mqtt.client as mqtt
import json
import time
import random

class TemperatureSensor:
    def __init__(self, device_id, mqtt_broker):
        self.device_id = device_id
        self.client = mqtt.Client()
        self.client.connect(mqtt_broker, 1883, 60)
        
    def send_reading(self, temperature):
        payload = {
            "device_id": self.device_id,
            "value": temperature,
            "unit": "celsius",
            "timestamp": time.time(),
            "battery_level": random.randint(80, 100)
        }
        
        self.client.publish(
            "inventory/sensors/temperature",
            json.dumps(payload)
        )

# Uso
sensor = TemperatureSensor("TEMP-SENSOR-001", "localhost")
sensor.send_reading(22.5)
```

### Cliente JavaScript para NFC

```javascript
class NFCReader {
    constructor(deviceId, mqttClient) {
        this.deviceId = deviceId;
        this.mqttClient = mqttClient;
    }
    
    simulateScan(nfcId) {
        const payload = {
            nfc_id: nfcId,
            device_id: this.deviceId,
            timestamp: new Date().toISOString(),
            location: "MAIN-WAREHOUSE",
            signal_strength: -45
        };
        
        this.mqttClient.publish(
            'inventory/nfc/scan',
            JSON.stringify(payload)
        );
    }
}

// Uso con biblioteca MQTT
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

const reader = new NFCReader('NFC-READER-001', client);
reader.simulateScan('NFC001');
```

## Seguridad IoT

### Autenticación de Dispositivos

1. **Certificados X.509**: Para dispositivos de alta seguridad
2. **Tokens JWT**: Para dispositivos con capacidad de procesamiento
3. **PSK (Pre-Shared Keys)**: Para dispositivos simples

### Cifrado de Comunicaciones

```bash
# Configurar TLS para MQTT
mosquitto_pub -h localhost -p 8883 \
  --cafile ca.crt \
  --cert device.crt \
  --key device.key \
  -t "inventory/sensors/temperature" \
  -m '{"value": 22.5}'
```

### Mejores Prácticas

1. **Cambiar credenciales por defecto**
2. **Usar cifrado TLS/SSL**
3. **Implementar autenticación mutua**
4. **Monitorear tráfico de red**
5. **Actualizar firmware regularmente**
6. **Segmentar red IoT**

## Mantenimiento y Diagnóstico

### Comandos de Diagnóstico

```bash
# Verificar estado de dispositivos
curl http://localhost:3004/api/devices

# Ver datos de sensores recientes
curl http://localhost:3004/api/iot/sensor-data?hours=24

# Verificar alertas activas
curl http://localhost:3004/api/iot/alerts?status=active

# Test de conectividad MQTT
mosquitto_pub -h localhost -t "test/connection" -m "ping"
mosquitto_sub -h localhost -t "test/connection"
```

### Logs y Monitoreo

```bash
# Ver logs del Gateway IoT
docker-compose logs -f iot-gateway

# Monitorear tráfico MQTT
mosquitto_sub -h localhost -t "#" -v

# Verificar estado de contenedores
docker-compose ps
```

## Escalabilidad

### Balanceador de Carga MQTT

Para entornos de producción con muchos dispositivos:

```yaml
# docker-compose.yml - Múltiples brokers MQTT
services:
  mqtt-broker-1:
    image: eclipse-mosquitto:2.0
    ports:
      - "1883:1883"
      
  mqtt-broker-2:
    image: eclipse-mosquitto:2.0
    ports:
      - "1884:1883"
      
  mqtt-load-balancer:
    image: haproxy:2.4
    volumes:
      - ./haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
    ports:
      - "1885:1885"
```

### Clustering de Gateways IoT

Para alta disponibilidad:

```yaml
iot-gateway-1:
  build: ./services/iot-gateway
  environment:
    - CLUSTER_NODE=1
    
iot-gateway-2:
  build: ./services/iot-gateway
  environment:
    - CLUSTER_NODE=2
```

Esta guía proporciona una base sólida para implementar y gestionar dispositivos IoT en el sistema de inventario. Para casos específicos, consulta la documentación de la API o contacta al equipo de desarrollo.
