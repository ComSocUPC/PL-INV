/**
 * 🎮 IoT Simulator - Simulador de Dispositivos IoT
 * 
 * Este archivo contiene funciones para simular dispositivos IoT reales
 * cuando no tenemos hardware físico disponible. Es perfecto para desarrollo
 * y testing del sistema.
 * 
 * 🎯 Objetivo didáctico:
 * - Entender cómo funcionan los dispositivos IoT
 * - Simular lecturas realistas de sensores
 * - Generar datos de prueba consistentes
 * - Manejar códigos NFC simulados
 */

const { v4: uuidv4 } = require('uuid');

// 📱 Códigos NFC simulados que representan productos
const SIMULATED_NFC_CODES = [
  'LAP-DELL-001',     // Laptop Dell Inspiron
  'SIL-ERG-001',      // Silla Ergonómica
  'PAP-A4-500',       // Papel A4
  'MON-LED-24',       // Monitor LED
  'CAF-PREM-1K',      // Café Premium
  'TEC-MECA-001',     // Teclado Mecánico (ficticio)
  'MOU-OPT-001',      // Mouse Óptico (ficticio)
  'USB-32GB-001',     // USB 32GB (ficticio)
  'CAB-HDMI-2M',      // Cable HDMI (ficticio)
  'AUR-BT-PRO'        // Auriculares Bluetooth (ficticio)
];

// 🌡️ Rangos realistas para sensores
const SENSOR_RANGES = {
  temperature: {
    normal: { min: 18, max: 26 },    // Temperatura normal de oficina
    cold: { min: -5, max: 5 },       // Área refrigerada
    hot: { min: 30, max: 40 }        // Área caliente (servidores)
  },
  humidity: {
    normal: { min: 40, max: 60 },    // Humedad ideal
    dry: { min: 20, max: 35 },       // Ambiente seco
    humid: { min: 70, max: 85 }      // Ambiente húmedo
  },
  motion: {
    normal: { min: 0, max: 1 }       // 0 = sin movimiento, 1 = con movimiento
  },
  light: {
    normal: { min: 300, max: 800 }   // Lux (iluminación de oficina)
  }
};

// 🚨 Umbrales para alertas
const ALERT_THRESHOLDS = {
  temperature: {
    low: 15,      // Muy frío
    high: 30,     // Muy caliente
    critical_low: 10,
    critical_high: 35
  },
  humidity: {
    low: 30,      // Muy seco
    high: 70,     // Muy húmedo
    critical_low: 20,
    critical_high: 80
  }
};

/**
 * 🎲 Generar ID único para dispositivo
 * @param {string} type - Tipo de dispositivo
 * @returns {string} ID único
 */
function generateRandomDeviceId(type = 'DEVICE') {
  const prefix = type.toUpperCase().substring(0, 3);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 📱 Simular lectura NFC
 * @param {string} deviceId - ID del dispositivo lector
 * @returns {Object} Lectura NFC simulada
 */
function simulateNFCReading(deviceId = null) {
  // Seleccionar código NFC aleatorio
  const nfcCode = SIMULATED_NFC_CODES[Math.floor(Math.random() * SIMULATED_NFC_CODES.length)];
  
  // Generar ID de dispositivo si no se proporciona
  if (!deviceId) {
    deviceId = generateRandomDeviceId('NFC');
  }
  
  console.log(`📱 Simulando lectura NFC: ${nfcCode} en dispositivo ${deviceId}`);
  
  return {
    device_id: deviceId,
    nfc_code: nfcCode,
    user_id: `user_${Math.floor(Math.random() * 100)}`, // Usuario simulado
    signal_strength: Math.floor(Math.random() * 100), // Fuerza de señal %
    read_duration: Math.floor(Math.random() * 1000) + 100, // ms
    metadata: {
      simulated: true,
      timestamp: new Date().toISOString(),
      reader_version: '1.0.0'
    }
  };
}

/**
 * 🌡️ Simular lectura de sensor
 * @param {string} deviceId - ID del dispositivo sensor
 * @param {string} sensorType - Tipo de sensor
 * @param {string} location - Ubicación (para determinar rangos)
 * @returns {Object} Lectura de sensor simulada
 */
function simulateSensorReading(deviceId = null, sensorType = 'temperature', location = 'normal') {
  // Generar ID de dispositivo si no se proporciona
  if (!deviceId) {
    deviceId = generateRandomDeviceId(sensorType.toUpperCase());
  }
  
  let value, unit;
  
  // Obtener rango apropiado según el tipo de sensor y ubicación
  const ranges = SENSOR_RANGES[sensorType];
  const range = ranges[location] || ranges.normal;
  
  switch (sensorType) {
    case 'temperature':
      // Generar temperatura con variación natural
      value = +(Math.random() * (range.max - range.min) + range.min).toFixed(1);
      unit = 'celsius';
      break;
      
    case 'humidity':
      // Generar humedad con variación natural
      value = +(Math.random() * (range.max - range.min) + range.min).toFixed(1);
      unit = 'percentage';
      break;
      
    case 'motion':
      // Movimiento binario con probabilidad
      value = Math.random() > 0.7 ? 1 : 0; // 30% probabilidad de movimiento
      unit = 'binary';
      break;
      
    case 'light':
      // Nivel de luz con variación
      value = Math.floor(Math.random() * (range.max - range.min) + range.min);
      unit = 'lux';
      break;
      
    default:
      console.warn(`⚠️ Tipo de sensor desconocido: ${sensorType}`);
      value = Math.random() * 100;
      unit = 'unknown';
  }
  
  console.log(`🌡️ Simulando sensor ${sensorType}: ${value} ${unit} en dispositivo ${deviceId}`);
  
  return {
    device_id: deviceId,
    sensor_type: sensorType,
    value: value,
    unit: unit,
    location: location,
    metadata: {
      simulated: true,
      timestamp: new Date().toISOString(),
      sensor_version: '2.1.0',
      calibration_date: '2025-01-01',
      battery_level: Math.floor(Math.random() * 100) // % batería
    }
  };
}

/**
 * ✅ Validar código NFC
 * @param {string} nfcCode - Código NFC a validar
 * @returns {Object} Resultado de validación
 */
function validateNFCCode(nfcCode) {
  // Verificar formato básico (al menos 3 caracteres, contiene guiones)
  const formatValid = nfcCode.length >= 3 && /^[A-Z0-9-]+$/i.test(nfcCode);
  
  // Verificar si es un código conocido
  const isKnownCode = SIMULATED_NFC_CODES.includes(nfcCode);
  
  console.log(`✅ Validando código NFC: ${nfcCode} - Formato: ${formatValid ? 'OK' : 'INVALID'} - Conocido: ${isKnownCode ? 'YES' : 'NO'}`);
  
  return {
    valid: formatValid,
    known_code: isKnownCode,
    format_error: !formatValid ? 'Código debe tener formato: XXX-XXX-XXX' : null
  };
}

/**
 * 📱 Procesar lectura NFC (simular consulta a servicio de productos)
 * @param {Object} nfcReading - Datos de lectura NFC
 * @returns {Promise<Object>} Resultado del procesamiento
 */
async function processNFCReading(nfcReading) {
  try {
    const { nfc_code, device_id, user_id } = nfcReading;
    
    console.log(`📱 Procesando lectura NFC: ${nfc_code}`);
    
    // Validar código NFC
    const validation = validateNFCCode(nfc_code);
    
    if (!validation.valid) {
      return {
        success: false,
        error: 'Código NFC inválido',
        details: validation.format_error,
        product_found: false
      };
    }
    
    // Simular consulta al servicio de productos
    const productFound = validation.known_code;
    
    if (productFound) {
      // Simular datos de producto encontrado
      const simulatedProduct = {
        code: nfc_code,
        name: getProductNameByCode(nfc_code),
        category: getCategoryByCode(nfc_code),
        stock: Math.floor(Math.random() * 100) + 1,
        location: getLocationByCode(nfc_code)
      };
      
      console.log(`✅ Producto encontrado: ${simulatedProduct.name}`);
      
      return {
        success: true,
        product_found: true,
        product: simulatedProduct,
        access_granted: true,
        user_id: user_id,
        timestamp: new Date().toISOString(),
        message: `Acceso concedido a ${simulatedProduct.name}`
      };
    } else {
      console.log(`❌ Producto no encontrado: ${nfc_code}`);
      
      return {
        success: false,
        product_found: false,
        access_granted: false,
        user_id: user_id,
        timestamp: new Date().toISOString(),
        message: `Código NFC no registrado: ${nfc_code}`,
        suggestion: 'Verificar código o registrar nuevo producto'
      };
    }
  } catch (error) {
    console.error('❌ Error procesando lectura NFC:', error.message);
    
    return {
      success: false,
      error: 'Error interno del sistema',
      details: error.message,
      product_found: false
    };
  }
}

/**
 * 🚨 Verificar si una lectura de sensor genera alertas
 * @param {Object} sensorReading - Datos de lectura del sensor
 * @returns {Promise<Object>} Resultado de verificación de alertas
 */
async function checkSensorAlerts(sensorReading) {
  try {
    const { sensor_type, value, device_id } = sensorReading;
    
    console.log(`🚨 Verificando alertas para sensor ${sensor_type}: ${value}`);
    
    const thresholds = ALERT_THRESHOLDS[sensor_type];
    
    if (!thresholds) {
      // No hay umbrales definidos para este tipo de sensor
      return {
        alert_needed: false,
        message: 'Sin umbrales definidos para este sensor'
      };
    }
    
    let alertNeeded = false;
    let severity = 'info';
    let message = '';
    let alertData = {};
    
    // Verificar umbrales según el tipo de sensor
    if (sensor_type === 'temperature') {
      if (value <= thresholds.critical_low) {
        alertNeeded = true;
        severity = 'critical';
        message = `🧊 Temperatura crítica baja: ${value}°C (mínimo: ${thresholds.critical_low}°C)`;
        alertData = { 
          threshold_exceeded: 'critical_low', 
          recommended_action: 'Verificar sistema de calefacción inmediatamente'
        };
      } else if (value >= thresholds.critical_high) {
        alertNeeded = true;
        severity = 'critical';
        message = `🔥 Temperatura crítica alta: ${value}°C (máximo: ${thresholds.critical_high}°C)`;
        alertData = { 
          threshold_exceeded: 'critical_high', 
          recommended_action: 'Verificar sistema de refrigeración inmediatamente'
        };
      } else if (value <= thresholds.low) {
        alertNeeded = true;
        severity = 'warning';
        message = `❄️ Temperatura baja: ${value}°C (recomendado: >${thresholds.low}°C)`;
        alertData = { threshold_exceeded: 'low' };
      } else if (value >= thresholds.high) {
        alertNeeded = true;
        severity = 'warning';
        message = `🌡️ Temperatura alta: ${value}°C (recomendado: <${thresholds.high}°C)`;
        alertData = { threshold_exceeded: 'high' };
      }
    } else if (sensor_type === 'humidity') {
      if (value <= thresholds.critical_low) {
        alertNeeded = true;
        severity = 'critical';
        message = `🏜️ Humedad crítica baja: ${value}% (mínimo: ${thresholds.critical_low}%)`;
        alertData = { 
          threshold_exceeded: 'critical_low',
          recommended_action: 'Activar humidificadores inmediatamente'
        };
      } else if (value >= thresholds.critical_high) {
        alertNeeded = true;
        severity = 'critical';
        message = `💧 Humedad crítica alta: ${value}% (máximo: ${thresholds.critical_high}%)`;
        alertData = { 
          threshold_exceeded: 'critical_high',
          recommended_action: 'Activar deshumidificadores inmediatamente'
        };
      } else if (value <= thresholds.low) {
        alertNeeded = true;
        severity = 'warning';
        message = `🌵 Humedad baja: ${value}% (recomendado: >${thresholds.low}%)`;
        alertData = { threshold_exceeded: 'low' };
      } else if (value >= thresholds.high) {
        alertNeeded = true;
        severity = 'warning';
        message = `🌊 Humedad alta: ${value}% (recomendado: <${thresholds.high}%)`;
        alertData = { threshold_exceeded: 'high' };
      }
    }
    
    if (alertNeeded) {
      console.log(`🚨 Alerta generada: ${message}`);
    } else {
      console.log(`✅ Sensor dentro de rangos normales: ${value}`);
    }
    
    return {
      alert_needed: alertNeeded,
      severity: severity,
      message: message,
      data: {
        sensor_value: value,
        device_id: device_id,
        timestamp: new Date().toISOString(),
        ...alertData
      }
    };
  } catch (error) {
    console.error('❌ Error verificando alertas:', error.message);
    
    return {
      alert_needed: true,
      severity: 'error',
      message: 'Error verificando umbrales del sensor',
      data: { error: error.message }
    };
  }
}

/**
 * 📦 Obtener nombre de producto por código (simulado)
 * @param {string} code - Código del producto
 * @returns {string} Nombre del producto
 */
function getProductNameByCode(code) {
  const productNames = {
    'LAP-DELL-001': 'Laptop Dell Inspiron 15',
    'SIL-ERG-001': 'Silla de Oficina Ergonómica',
    'PAP-A4-500': 'Papel Bond A4 (500 hojas)',
    'MON-LED-24': 'Monitor LED 24 pulgadas',
    'CAF-PREM-1K': 'Café Premium 1kg',
    'TEC-MECA-001': 'Teclado Mecánico RGB',
    'MOU-OPT-001': 'Mouse Óptico Inalámbrico',
    'USB-32GB-001': 'USB Flash Drive 32GB',
    'CAB-HDMI-2M': 'Cable HDMI 2 metros',
    'AUR-BT-PRO': 'Auriculares Bluetooth Pro'
  };
  
  return productNames[code] || `Producto ${code}`;
}

/**
 * 📊 Obtener categoría por código (simulado)
 * @param {string} code - Código del producto
 * @returns {string} Categoría del producto
 */
function getCategoryByCode(code) {
  if (code.startsWith('LAP') || code.startsWith('MON') || code.startsWith('TEC') || code.startsWith('MOU') || code.startsWith('USB') || code.startsWith('CAB') || code.startsWith('AUR')) {
    return 'Electrónicos';
  } else if (code.startsWith('SIL')) {
    return 'Mobiliario';
  } else if (code.startsWith('PAP')) {
    return 'Papelería';
  } else if (code.startsWith('CAF')) {
    return 'Alimentos';
  }
  
  return 'General';
}

/**
 * 📍 Obtener ubicación por código (simulado)
 * @param {string} code - Código del producto
 * @returns {string} Ubicación del producto
 */
function getLocationByCode(code) {
  const locations = [
    'Estante A-1',
    'Estante A-2',
    'Estante B-1',
    'Estante B-2',
    'Almacén Principal',
    'Área Refrigerada',
    'Depósito General'
  ];
  
  // Generar ubicación consistente basada en el código
  const index = code.length % locations.length;
  return locations[index];
}

/**
 * 🎮 Generar múltiples lecturas simuladas
 * @param {number} count - Número de lecturas a generar
 * @param {string} type - Tipo de lectura ('nfc' o 'sensor')
 * @returns {Array} Array de lecturas simuladas
 */
function generateMultipleReadings(count = 5, type = 'sensor') {
  const readings = [];
  
  for (let i = 0; i < count; i++) {
    if (type === 'nfc') {
      readings.push(simulateNFCReading());
    } else {
      const sensorTypes = ['temperature', 'humidity', 'motion', 'light'];
      const randomType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
      readings.push(simulateSensorReading(null, randomType));
    }
  }
  
  console.log(`🎮 Generadas ${count} lecturas simuladas de tipo ${type}`);
  return readings;
}

// 📤 Exportar todas las funciones
module.exports = {
  generateRandomDeviceId,
  simulateNFCReading,
  simulateSensorReading,
  validateNFCCode,
  processNFCReading,
  checkSensorAlerts,
  getProductNameByCode,
  getCategoryByCode,
  getLocationByCode,
  generateMultipleReadings,
  SIMULATED_NFC_CODES,
  SENSOR_RANGES,
  ALERT_THRESHOLDS
};
