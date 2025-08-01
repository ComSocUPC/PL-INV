const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const mqttClient = require('./config/mqtt');
const iotRoutes = require('./routes/iot');
const deviceRoutes = require('./routes/devices');
const healthRoutes = require('./routes/health');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');
const deviceManager = require('./services/deviceManager');
const sensorProcessor = require('./services/sensorProcessor');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3004;

// WebSocket para comunicación en tiempo real
const wss = new WebSocket.Server({ server });

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Más permisivo para IoT
  message: {
    error: 'Demasiadas peticiones, intenta de nuevo más tarde'
  }
});

app.use(limiter);

// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rutas públicas
app.use('/health', healthRoutes);

// Rutas protegidas
app.use('/api/iot', authMiddleware, iotRoutes);
app.use('/api/devices', authMiddleware, deviceRoutes);

// Ruta por defecto
app.get('/api', (req, res) => {
  res.json({
    message: 'Gateway IoT - Sistema de Inventario',
    version: '1.0.0',
    features: {
      nfc: process.env.NFC_READER_ENABLED === 'true',
      temperature: process.env.TEMPERATURE_SENSOR_ENABLED === 'true',
      motion: process.env.MOTION_SENSOR_ENABLED === 'true'
    },
    endpoints: {
      health: '/health',
      iot: '/api/iot',
      devices: '/api/devices',
      websocket: 'ws://localhost:' + PORT
    }
  });
});

// Configuración WebSocket
wss.on('connection', (ws, req) => {
  logger.info('Nueva conexión WebSocket establecida');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.info('Mensaje WebSocket recibido:', data);
      
      // Manejar diferentes tipos de mensajes
      switch (data.type) {
        case 'subscribe':
          ws.deviceId = data.deviceId;
          ws.topics = data.topics || [];
          logger.info(`Cliente suscrito a: ${ws.topics.join(', ')}`);
          break;
        case 'nfc_scan':
          handleNFCScan(data.payload, ws);
          break;
        default:
          logger.warn('Tipo de mensaje WebSocket no reconocido:', data.type);
      }
    } catch (error) {
      logger.error('Error procesando mensaje WebSocket:', error);
    }
  });

  ws.on('close', () => {
    logger.info('Conexión WebSocket cerrada');
  });

  ws.on('error', (error) => {
    logger.error('Error en WebSocket:', error);
  });
});

// Configuración MQTT
mqttClient.on('connect', () => {
  logger.info('Conectado al broker MQTT');
  
  // Suscribirse a topics IoT
  const topics = [
    'inventory/nfc/scan',
    'inventory/sensors/temperature',
    'inventory/sensors/motion',
    'inventory/sensors/humidity',
    'inventory/devices/status',
    'inventory/alerts'
  ];

  topics.forEach(topic => {
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        logger.error(`Error suscribiéndose a ${topic}:`, err);
      } else {
        logger.info(`Suscrito a topic: ${topic}`);
      }
    });
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    logger.info(`Mensaje MQTT recibido en ${topic}:`, data);

    // Procesar mensaje según el topic
    switch (topic) {
      case 'inventory/nfc/scan':
        await handleNFCScan(data);
        break;
      case 'inventory/sensors/temperature':
        await sensorProcessor.processTemperature(data);
        break;
      case 'inventory/sensors/motion':
        await sensorProcessor.processMotion(data);
        break;
      case 'inventory/sensors/humidity':
        await sensorProcessor.processHumidity(data);
        break;
      case 'inventory/devices/status':
        await deviceManager.updateDeviceStatus(data);
        break;
      case 'inventory/alerts':
        await handleAlert(data);
        break;
      default:
        logger.warn('Topic MQTT no reconocido:', topic);
    }

    // Reenviar a clientes WebSocket suscritos
    broadcastToWebSocketClients(topic, data);

  } catch (error) {
    logger.error(`Error procesando mensaje MQTT de ${topic}:`, error);
  }
});

// Función para manejar lecturas NFC
async function handleNFCScan(data, ws = null) {
  try {
    logger.info('Procesando lectura NFC:', data);

    const { nfcId, deviceId, timestamp, location } = data;

    if (!nfcId) {
      logger.warn('Lectura NFC sin ID válido');
      return;
    }

    // Registrar la lectura en la base de datos
    await deviceManager.registerNFCScan({
      nfc_id: nfcId,
      device_id: deviceId,
      timestamp: timestamp || new Date(),
      location: location || 'unknown',
      raw_data: JSON.stringify(data)
    });

    // Buscar producto asociado al NFC
    const product = await deviceManager.findProductByNFC(nfcId);
    
    if (product) {
      // Notificar al servicio de inventario
      const inventoryData = {
        productId: product.id,
        action: 'nfc_scan',
        location,
        timestamp: timestamp || new Date(),
        deviceId
      };

      await notifyInventoryService(inventoryData);

      // Responder al cliente WebSocket si está disponible
      if (ws) {
        ws.send(JSON.stringify({
          type: 'nfc_scan_result',
          success: true,
          product,
          timestamp: new Date()
        }));
      }

      logger.info(`Producto identificado por NFC: ${product.name} (${product.sku})`);
    } else {
      logger.warn(`No se encontró producto para NFC ID: ${nfcId}`);
      
      if (ws) {
        ws.send(JSON.stringify({
          type: 'nfc_scan_result',
          success: false,
          error: 'Producto no encontrado',
          nfcId,
          timestamp: new Date()
        }));
      }
    }

  } catch (error) {
    logger.error('Error manejando lectura NFC:', error);
    
    if (ws) {
      ws.send(JSON.stringify({
        type: 'nfc_scan_result',
        success: false,
        error: 'Error interno procesando NFC',
        timestamp: new Date()
      }));
    }
  }
}

// Función para manejar alertas
async function handleAlert(data) {
  try {
    logger.warn('Alerta IoT recibida:', data);

    // Registrar alerta en la base de datos
    await deviceManager.registerAlert(data);

    // Enviar notificación a sistemas externos si es crítica
    if (data.severity === 'critical') {
      // Aquí se podría enviar email, SMS, etc.
      logger.error('ALERTA CRÍTICA:', data);
    }

  } catch (error) {
    logger.error('Error manejando alerta:', error);
  }
}

// Función para enviar datos a clientes WebSocket
function broadcastToWebSocketClients(topic, data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      if (!client.topics || client.topics.includes(topic) || client.topics.includes('*')) {
        client.send(JSON.stringify({
          type: 'mqtt_message',
          topic,
          data,
          timestamp: new Date()
        }));
      }
    }
  });
}

// Función para notificar al servicio de inventario
async function notifyInventoryService(data) {
  try {
    const axios = require('axios');
    const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';
    
    await axios.post(`${inventoryUrl}/api/inventory/iot-event`, data, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service': 'iot-gateway'
      }
    });

    logger.info('Evento IoT enviado al servicio de inventario');
  } catch (error) {
    logger.error('Error notificando al servicio de inventario:', error);
  }
}

// Manejo de errores
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  
  // Cerrar conexiones MQTT
  mqttClient.end();
  
  // Cerrar WebSocket
  wss.close();
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  
  // Cerrar conexiones MQTT
  mqttClient.end();
  
  // Cerrar WebSocket
  wss.close();
  
  process.exit(0);
});

server.listen(PORT, () => {
  logger.info(`Gateway IoT ejecutándose en puerto ${PORT}`);
  logger.info(`WebSocket disponible en ws://localhost:${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
