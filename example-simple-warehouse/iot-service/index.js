/**
 * 🌐 Servicio IoT - IoT Service
 * 
 * Este microservicio maneja todos los dispositivos IoT del almacén:
 * - Lectores NFC para identificación de productos
 * - Sensores de temperatura y humedad
 * - Alertas automáticas
 * - Comunicación MQTT
 * - WebSockets para tiempo real
 * 
 * 🎯 Objetivo didáctico:
 * - Entender integración IoT en microservicios
 * - Manejar protocolos MQTT y WebSockets
 * - Implementar simuladores de dispositivos
 * - Gestionar alertas y automatización
 * 
 * 🔗 Puerto: 3003
 * 💾 Base de datos: SQLite (warehouse_iot.db)
 * 📡 MQTT: Simulado internamente
 * 🔄 WebSocket: Puerto 3003/ws
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const WebSocket = require('ws');
const http = require('http');
const cron = require('node-cron');

// 📝 Importar funciones de base de datos y dispositivos
const {
  initDatabase,
  createDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
  createReading,
  getReadings,
  createAlert,
  getAlerts,
  markAlertAsRead,
  getDeviceStats,
  closeDatabase
} = require('./database');

const {
  simulateNFCReading,
  simulateSensorReading,
  generateRandomDeviceId,
  validateNFCCode,
  processNFCReading,
  checkSensorAlerts
} = require('./iot-simulator');

// 🚀 Crear aplicación Express y servidor HTTP
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3003;

console.log('🌐 Iniciando Servicio IoT...');

// 🛡️ Middlewares de seguridad y utilidad
app.use(helmet()); // Headers de seguridad
app.use(cors()); // Permitir peticiones desde otros dominios
app.use(compression()); // Comprimir respuestas
app.use(morgan('combined')); // Logs de peticiones HTTP

// 📦 Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🚦 Rate limiting: máximo 200 peticiones por 15 minutos (IoT genera muchas peticiones)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 peticiones
  message: {
    error: 'Demasiadas peticiones IoT, intenta de nuevo en 15 minutos'
  }
});
app.use(limiter);

// 🔌 Configurar WebSocket Server para comunicación en tiempo real
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  perMessageDeflate: false
});

// 📊 Variables globales para el estado del servicio
let connectedClients = new Set();
let deviceStatus = new Map();
let alertCount = 0;

// 📡 Configurar WebSocket para comunicación en tiempo real
wss.on('connection', (ws, req) => {
  console.log('🔌 Cliente WebSocket conectado');
  connectedClients.add(ws);
  
  // Enviar estado actual al conectarse
  ws.send(JSON.stringify({
    type: 'status',
    data: {
      connected_devices: deviceStatus.size,
      active_alerts: alertCount,
      timestamp: new Date().toISOString()
    }
  }));
  
  ws.on('close', () => {
    console.log('🔌 Cliente WebSocket desconectado');
    connectedClients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ Error WebSocket:', error.message);
    connectedClients.delete(ws);
  });
});

/**
 * 📡 Función para enviar datos a todos los clientes WebSocket conectados
 * @param {Object} data - Datos a enviar
 */
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        console.error('❌ Error enviando WebSocket:', error.message);
        connectedClients.delete(client);
      }
    }
  });
}

// 📊 Configuración de Swagger/OpenAPI
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '🌐 IoT Service API',
      version: '1.0.0',
      description: `
        # Servicio IoT - API para Dispositivos y Sensores
        
        Este servicio maneja toda la infraestructura IoT del almacén.
        
        ## Funcionalidades:
        - ✅ Gestión de dispositivos IoT (NFC, sensores)
        - ✅ Lecturas NFC para identificación de productos
        - ✅ Monitoreo de sensores (temperatura, humedad)
        - ✅ Sistema de alertas automáticas
        - ✅ Comunicación en tiempo real (WebSockets)
        - ✅ Simuladores para desarrollo
        
        ## Dispositivos Soportados:
        - 📱 Lectores NFC
        - 🌡️ Sensores de temperatura
        - 💧 Sensores de humedad
        - 🚨 Sistemas de alerta
        
        ## Protocolos:
        - HTTP REST API
        - WebSockets (tiempo real)
        - MQTT (simulado)
      `,
      contact: {
        name: 'Proyecto COMSOC',
        email: 'admin@almacen.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Servidor IoT de desarrollo'
      }
    ],
    tags: [
      {
        name: 'devices',
        description: 'Gestión de dispositivos IoT'
      },
      {
        name: 'nfc',
        description: 'Lecturas NFC'
      },
      {
        name: 'sensors',
        description: 'Sensores ambientales'
      },
      {
        name: 'alerts',
        description: 'Sistema de alertas'
      },
      {
        name: 'simulation',
        description: 'Simuladores para desarrollo'
      },
      {
        name: 'health',
        description: 'Estado del servicio'
      }
    ]
  },
  apis: ['./index.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 📚 Ruta para documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '🌐 IoT Service API'
}));

// 🏥 Esquemas de validación con Joi
const deviceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  
  type: Joi.string().valid('nfc_reader', 'temperature_sensor', 'humidity_sensor', 'motion_sensor', 'camera').required()
    .messages({
      'any.only': 'Tipo debe ser: nfc_reader, temperature_sensor, humidity_sensor, motion_sensor, camera',
      'any.required': 'El tipo es obligatorio'
    }),
  
  location: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'La ubicación debe tener al menos 2 caracteres',
      'any.required': 'La ubicación es obligatoria'
    }),
  
  device_id: Joi.string().min(5).max(50).required()
    .messages({
      'string.min': 'El ID del dispositivo debe tener al menos 5 caracteres',
      'any.required': 'El ID del dispositivo es obligatorio'
    }),
  
  active: Joi.boolean().default(true),
  
  configuration: Joi.object().optional().default({})
});

const nfcReadingSchema = Joi.object({
  device_id: Joi.string().required()
    .messages({
      'any.required': 'El ID del dispositivo es obligatorio'
    }),
  
  nfc_code: Joi.string().min(3).max(50).required()
    .messages({
      'string.min': 'El código NFC debe tener al menos 3 caracteres',
      'any.required': 'El código NFC es obligatorio'
    }),
  
  user_id: Joi.string().optional(),
  
  metadata: Joi.object().optional().default({})
});

const sensorReadingSchema = Joi.object({
  device_id: Joi.string().required()
    .messages({
      'any.required': 'El ID del dispositivo es obligatorio'
    }),
  
  sensor_type: Joi.string().valid('temperature', 'humidity', 'motion', 'light').required()
    .messages({
      'any.only': 'Tipo de sensor debe ser: temperature, humidity, motion, light',
      'any.required': 'El tipo de sensor es obligatorio'
    }),
  
  value: Joi.number().required()
    .messages({
      'any.required': 'El valor de lectura es obligatorio'
    }),
  
  unit: Joi.string().required()
    .messages({
      'any.required': 'La unidad es obligatoria'
    }),
  
  metadata: Joi.object().optional().default({})
});

/**
 * 🏥 Health Check - Verificar estado del servicio IoT
 */
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a base de datos y obtener estadísticas
    const stats = await getDeviceStats();
    
    res.status(200).json({
      status: 'healthy',
      service: 'iot-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
      websocket: {
        connected_clients: connectedClients.size,
        status: 'running'
      },
      devices: {
        total: stats.total_devices,
        active: stats.active_devices,
        online: deviceStatus.size
      },
      alerts: {
        total: stats.total_alerts,
        unread: stats.unread_alerts
      }
    });
  } catch (error) {
    console.error('❌ Error en health check:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      service: 'iot-service',
      error: 'Database or system failure'
    });
  }
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [health]
 *     summary: 🏥 Verificar estado del servicio IoT
 *     description: Endpoint para monitoreo de salud del servicio
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 */

/**
 * 📱 Obtener todos los dispositivos IoT
 */
app.get('/api/devices', async (req, res) => {
  try {
    console.log('📱 Obteniendo lista de dispositivos IoT...');
    
    const { type, location, active = 'true' } = req.query;
    
    const devices = await getAllDevices({
      type,
      location,
      active: active === 'true'
    });
    
    // Agregar estado en línea a cada dispositivo
    const devicesWithStatus = devices.map(device => ({
      ...device,
      online: deviceStatus.has(device.device_id),
      last_seen: deviceStatus.get(device.device_id)?.last_seen || null
    }));
    
    console.log(`✅ Se encontraron ${devices.length} dispositivos`);
    
    res.status(200).json({
      success: true,
      data: devicesWithStatus,
      filters: { type, location, active: active === 'true' }
    });
  } catch (error) {
    console.error('❌ Error obteniendo dispositivos:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudieron obtener los dispositivos'
    });
  }
});

/**
 * ➕ Registrar nuevo dispositivo IoT
 */
app.post('/api/devices', async (req, res) => {
  try {
    console.log('➕ Registrando nuevo dispositivo IoT...');
    
    // Validar datos de entrada
    const { error, value } = deviceSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Datos inválidos:', error.details[0].message);
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details[0].message,
        field: error.details[0].path[0]
      });
    }
    
    // Crear dispositivo
    const deviceId = await createDevice({
      ...value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // Obtener dispositivo creado
    const newDevice = await getDeviceById(deviceId);
    
    console.log(`✅ Dispositivo creado: ${newDevice.name} (${newDevice.device_id})`);
    
    // Notificar a clientes WebSocket
    broadcastToClients({
      type: 'device_registered',
      data: newDevice
    });
    
    res.status(201).json({
      success: true,
      message: 'Dispositivo registrado exitosamente',
      data: newDevice
    });
  } catch (error) {
    console.error('❌ Error registrando dispositivo:', error.message);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        error: 'Device ID duplicado',
        details: 'Ya existe un dispositivo con este ID'
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo registrar el dispositivo'
    });
  }
});

/**
 * 🔍 Obtener dispositivo por ID
 */
app.get('/api/devices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Buscando dispositivo ID: ${id}`);
    
    const device = await getDeviceById(parseInt(id));
    
    if (!device) {
      return res.status(404).json({
        error: 'Dispositivo no encontrado',
        details: `No existe un dispositivo con ID ${id}`
      });
    }
    
    // Agregar estado en línea
    const deviceWithStatus = {
      ...device,
      online: deviceStatus.has(device.device_id),
      last_seen: deviceStatus.get(device.device_id)?.last_seen || null
    };
    
    console.log(`✅ Dispositivo encontrado: ${device.name}`);
    
    res.status(200).json({
      success: true,
      data: deviceWithStatus
    });
  } catch (error) {
    console.error('❌ Error obteniendo dispositivo:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo obtener el dispositivo'
    });
  }
});

/**
 * 📱 Procesar lectura NFC
 */
app.post('/api/nfc/reading', async (req, res) => {
  try {
    console.log('📱 Procesando lectura NFC...');
    
    // Validar datos de entrada
    const { error, value } = nfcReadingSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details[0].message
      });
    }
    
    // Verificar que el dispositivo existe y está activo
    const device = await getAllDevices({ device_id: value.device_id });
    if (!device.length || !device[0].active) {
      return res.status(404).json({
        error: 'Dispositivo no encontrado o inactivo',
        details: `Dispositivo ${value.device_id} no está disponible`
      });
    }
    
    // Procesar lectura NFC
    const result = await processNFCReading(value);
    
    // Guardar lectura en base de datos
    const readingId = await createReading({
      device_id: value.device_id,
      type: 'nfc',
      data: {
        nfc_code: value.nfc_code,
        user_id: value.user_id,
        product_found: result.product_found,
        ...value.metadata
      },
      timestamp: new Date().toISOString()
    });
    
    // Actualizar estado del dispositivo
    deviceStatus.set(value.device_id, {
      last_seen: new Date().toISOString(),
      status: 'online'
    });
    
    console.log(`✅ Lectura NFC procesada: ${value.nfc_code}`);
    
    // Notificar a clientes WebSocket
    broadcastToClients({
      type: 'nfc_reading',
      data: {
        reading_id: readingId,
        device_id: value.device_id,
        nfc_code: value.nfc_code,
        result,
        timestamp: new Date().toISOString()
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Lectura NFC procesada exitosamente',
      data: {
        reading_id: readingId,
        ...result
      }
    });
  } catch (error) {
    console.error('❌ Error procesando lectura NFC:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo procesar la lectura NFC'
    });
  }
});

/**
 * 🌡️ Procesar lectura de sensor
 */
app.post('/api/sensors/reading', async (req, res) => {
  try {
    console.log('🌡️ Procesando lectura de sensor...');
    
    // Validar datos de entrada
    const { error, value } = sensorReadingSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details[0].message
      });
    }
    
    // Verificar que el dispositivo existe y está activo
    const device = await getAllDevices({ device_id: value.device_id });
    if (!device.length || !device[0].active) {
      return res.status(404).json({
        error: 'Dispositivo no encontrado o inactivo',
        details: `Dispositivo ${value.device_id} no está disponible`
      });
    }
    
    // Guardar lectura en base de datos
    const readingId = await createReading({
      device_id: value.device_id,
      type: 'sensor',
      data: {
        sensor_type: value.sensor_type,
        value: value.value,
        unit: value.unit,
        ...value.metadata
      },
      timestamp: new Date().toISOString()
    });
    
    // Verificar si la lectura genera alertas
    const alertResult = await checkSensorAlerts(value);
    
    // Crear alerta si es necesario
    if (alertResult.alert_needed) {
      const alertId = await createAlert({
        device_id: value.device_id,
        type: 'sensor_alert',
        severity: alertResult.severity,
        message: alertResult.message,
        data: alertResult.data,
        timestamp: new Date().toISOString()
      });
      
      alertCount++;
      
      console.log(`🚨 Alerta creada: ${alertResult.message}`);
      
      // Notificar alerta por WebSocket
      broadcastToClients({
        type: 'alert',
        data: {
          alert_id: alertId,
          severity: alertResult.severity,
          message: alertResult.message,
          device_id: value.device_id,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Actualizar estado del dispositivo
    deviceStatus.set(value.device_id, {
      last_seen: new Date().toISOString(),
      status: 'online',
      last_reading: value.value
    });
    
    console.log(`✅ Lectura de sensor procesada: ${value.sensor_type} = ${value.value} ${value.unit}`);
    
    // Notificar a clientes WebSocket
    broadcastToClients({
      type: 'sensor_reading',
      data: {
        reading_id: readingId,
        device_id: value.device_id,
        sensor_type: value.sensor_type,
        value: value.value,
        unit: value.unit,
        alert: alertResult.alert_needed ? alertResult : null,
        timestamp: new Date().toISOString()
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Lectura de sensor procesada exitosamente',
      data: {
        reading_id: readingId,
        value: value.value,
        unit: value.unit,
        alert: alertResult.alert_needed ? alertResult : null
      }
    });
  } catch (error) {
    console.error('❌ Error procesando lectura de sensor:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo procesar la lectura del sensor'
    });
  }
});

/**
 * 📊 Obtener lecturas de dispositivos
 */
app.get('/api/readings', async (req, res) => {
  try {
    const { 
      device_id, 
      type, 
      limit = 50, 
      hours = 24 
    } = req.query;
    
    console.log('📊 Obteniendo lecturas de dispositivos...');
    
    const readings = await getReadings({
      device_id,
      type,
      limit: Math.min(parseInt(limit), 1000),
      hours: parseInt(hours)
    });
    
    console.log(`✅ Se encontraron ${readings.length} lecturas`);
    
    res.status(200).json({
      success: true,
      data: readings,
      filters: { device_id, type, limit, hours }
    });
  } catch (error) {
    console.error('❌ Error obteniendo lecturas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudieron obtener las lecturas'
    });
  }
});

/**
 * 🚨 Obtener alertas del sistema
 */
app.get('/api/alerts', async (req, res) => {
  try {
    const { 
      device_id, 
      severity, 
      read = 'false',
      limit = 50 
    } = req.query;
    
    console.log('🚨 Obteniendo alertas del sistema...');
    
    const alerts = await getAlerts({
      device_id,
      severity,
      read: read === 'true',
      limit: Math.min(parseInt(limit), 200)
    });
    
    console.log(`✅ Se encontraron ${alerts.length} alertas`);
    
    res.status(200).json({
      success: true,
      data: alerts,
      filters: { device_id, severity, read, limit }
    });
  } catch (error) {
    console.error('❌ Error obteniendo alertas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudieron obtener las alertas'
    });
  }
});

/**
 * ✅ Marcar alerta como leída
 */
app.patch('/api/alerts/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`✅ Marcando alerta como leída: ${id}`);
    
    const success = await markAlertAsRead(parseInt(id));
    
    if (!success) {
      return res.status(404).json({
        error: 'Alerta no encontrada',
        details: `No existe una alerta con ID ${id}`
      });
    }
    
    alertCount = Math.max(0, alertCount - 1);
    
    // Notificar por WebSocket
    broadcastToClients({
      type: 'alert_read',
      data: {
        alert_id: parseInt(id),
        timestamp: new Date().toISOString()
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Alerta marcada como leída'
    });
  } catch (error) {
    console.error('❌ Error marcando alerta como leída:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo marcar la alerta como leída'
    });
  }
});

/**
 * 🎮 Simular lectura NFC (para desarrollo)
 */
app.post('/api/simulate/nfc', async (req, res) => {
  try {
    console.log('🎮 Simulando lectura NFC...');
    
    const { device_id } = req.body;
    
    // Generar lectura NFC simulada
    const simulatedReading = simulateNFCReading(device_id);
    
    // Procesar como lectura real
    const result = await processNFCReading(simulatedReading);
    
    // Guardar en base de datos
    const readingId = await createReading({
      device_id: simulatedReading.device_id,
      type: 'nfc',
      data: {
        nfc_code: simulatedReading.nfc_code,
        simulated: true,
        product_found: result.product_found
      },
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Lectura NFC simulada: ${simulatedReading.nfc_code}`);
    
    // Notificar por WebSocket
    broadcastToClients({
      type: 'nfc_reading',
      data: {
        reading_id: readingId,
        device_id: simulatedReading.device_id,
        nfc_code: simulatedReading.nfc_code,
        result,
        simulated: true,
        timestamp: new Date().toISOString()
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Lectura NFC simulada exitosamente',
      data: {
        reading_id: readingId,
        simulated_reading: simulatedReading,
        result
      }
    });
  } catch (error) {
    console.error('❌ Error simulando lectura NFC:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo simular la lectura NFC'
    });
  }
});

/**
 * 🎮 Simular lectura de sensor (para desarrollo)
 */
app.post('/api/simulate/sensor', async (req, res) => {
  try {
    console.log('🎮 Simulando lectura de sensor...');
    
    const { device_id, sensor_type } = req.body;
    
    // Generar lectura de sensor simulada
    const simulatedReading = simulateSensorReading(device_id, sensor_type);
    
    // Procesar como lectura real (reutilizar endpoint)
    const response = await fetch(`http://localhost:${PORT}/api/sensors/reading`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...simulatedReading,
        metadata: { simulated: true }
      })
    });
    
    const result = await response.json();
    
    console.log(`✅ Lectura de sensor simulada: ${sensor_type} = ${simulatedReading.value}`);
    
    res.status(200).json({
      success: true,
      message: 'Lectura de sensor simulada exitosamente',
      data: {
        simulated_reading: simulatedReading,
        result: result.data
      }
    });
  } catch (error) {
    console.error('❌ Error simulando lectura de sensor:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo simular la lectura del sensor'
    });
  }
});

/**
 * 📊 Obtener estadísticas de IoT
 */
app.get('/api/stats', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de IoT...');
    
    const stats = await getDeviceStats();
    
    // Agregar estadísticas en tiempo real
    const realtimeStats = {
      ...stats,
      online_devices: deviceStatus.size,
      websocket_clients: connectedClients.size,
      active_alerts: alertCount,
      device_status: Array.from(deviceStatus.entries()).map(([device_id, status]) => ({
        device_id,
        ...status
      }))
    };
    
    console.log('✅ Estadísticas de IoT obtenidas');
    
    res.status(200).json({
      success: true,
      data: realtimeStats,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudieron obtener las estadísticas'
    });
  }
});

// 🎯 Tareas programadas (cron jobs)
// Simular lecturas de sensores cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('🔄 Ejecutando simulación automática de sensores...');
    
    // Obtener dispositivos activos
    const devices = await getAllDevices({ active: true });
    const sensorDevices = devices.filter(d => 
      d.type.includes('sensor') && Math.random() > 0.5 // 50% de probabilidad
    );
    
    // Simular lecturas
    for (const device of sensorDevices.slice(0, 3)) { // Máximo 3 por ciclo
      const sensorType = device.type.replace('_sensor', '');
      const reading = simulateSensorReading(device.device_id, sensorType);
      
      // Enviar lectura (usando endpoint interno)
      try {
        await fetch(`http://localhost:${PORT}/api/sensors/reading`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...reading,
            metadata: { automated: true }
          })
        });
      } catch (err) {
        console.error('❌ Error en simulación automática:', err.message);
      }
    }
  } catch (error) {
    console.error('❌ Error en tarea programada:', error.message);
  }
});

/**
 * 🚫 Middleware para rutas no encontradas
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    details: `La ruta ${req.method} ${req.originalUrl} no existe`,
    available_endpoints: [
      'GET /health',
      'GET /api/devices',
      'POST /api/devices',
      'GET /api/devices/:id',
      'POST /api/nfc/reading',
      'POST /api/sensors/reading',
      'GET /api/readings',
      'GET /api/alerts',
      'PATCH /api/alerts/:id/read',
      'POST /api/simulate/nfc',
      'POST /api/simulate/sensor',
      'GET /api/stats',
      'WS /ws (WebSocket)',
      'GET /api-docs (Swagger UI)'
    ]
  });
});

/**
 * 🚨 Middleware global de manejo de errores
 */
app.use((error, req, res, next) => {
  console.error('🚨 Error no manejado:', error);
  
  res.status(500).json({
    error: 'Error interno del servidor',
    details: 'Ocurrió un error inesperado en el servicio IoT',
    timestamp: new Date().toISOString()
  });
});

/**
 * 🚀 Iniciar el servidor
 */
async function startServer() {
  try {
    // Inicializar base de datos
    console.log('💾 Inicializando base de datos IoT...');
    await initDatabase();
    
    // Iniciar servidor HTTP con WebSocket
    server.listen(PORT, () => {
      console.log(`
🚀 ========================================
   🌐  IOT SERVICE INICIADO
========================================
🌐 URL: http://localhost:${PORT}
📚 Docs: http://localhost:${PORT}/api-docs
🏥 Health: http://localhost:${PORT}/health
📱 Devices: http://localhost:${PORT}/api/devices
🔌 WebSocket: ws://localhost:${PORT}/ws
========================================
      `);
    });
    
    // Manejar cierre graceful
    process.on('SIGTERM', () => {
      console.log('🛑 Recibido SIGTERM, cerrando servidor IoT...');
      wss.close(() => {
        server.close(() => {
          console.log('✅ Servidor IoT cerrado');
          closeDatabase();
          process.exit(0);
        });
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 Recibido SIGINT, cerrando servidor IoT...');
      wss.close(() => {
        server.close(() => {
          console.log('✅ Servidor IoT cerrado');
          closeDatabase();
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    console.error('💥 Error fatal iniciando el servidor IoT:', error);
    process.exit(1);
  }
}

// 🎬 Iniciar todo
startServer().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
