/**
 * 💾 Database - Manejo de Base de Datos SQLite para IoT
 * 
 * Este archivo maneja todas las operaciones de base de datos para dispositivos IoT,
 * lecturas de sensores, alertas y logs del sistema.
 * 
 * 🎯 Objetivo didáctico: Entender gestión de datos IoT y time series
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 📂 Ubicación de la base de datos
const DB_PATH = path.join(__dirname, 'warehouse_iot.db');

console.log(`💾 Base de datos IoT SQLite en: ${DB_PATH}`);

// 🔗 Conexión a la base de datos
let db = null;

/**
 * 🚀 Inicializar la base de datos
 * Crea las tablas necesarias si no existen
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    // Crear o abrir la base de datos
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Conectado a la base de datos IoT SQLite');
      
      // Crear tablas en paralelo
      Promise.all([
        createDevicesTable(),
        createReadingsTable(),
        createAlertsTable()
      ])
      .then(() => createIndexes())
      .then(() => createSampleDevices())
      .then(() => {
        console.log('✅ Base de datos IoT inicializada correctamente');
        resolve();
      })
      .catch(reject);
    });
  });
}

/**
 * 📱 Crear tabla de dispositivos IoT
 */
function createDevicesTable() {
  return new Promise((resolve, reject) => {
    const createDevicesTable = `
      CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        device_id TEXT UNIQUE NOT NULL,
        location TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT 1,
        configuration TEXT DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;
    
    db.run(createDevicesTable, (err) => {
      if (err) {
        console.error('❌ Error creando tabla devices:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Tabla devices lista');
      resolve();
    });
  });
}

/**
 * 📊 Crear tabla de lecturas (time series)
 */
function createReadingsTable() {
  return new Promise((resolve, reject) => {
    const createReadingsTable = `
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (device_id) REFERENCES devices (device_id)
      )
    `;
    
    db.run(createReadingsTable, (err) => {
      if (err) {
        console.error('❌ Error creando tabla readings:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Tabla readings lista');
      resolve();
    });
  });
}

/**
 * 🚨 Crear tabla de alertas
 */
function createAlertsTable() {
  return new Promise((resolve, reject) => {
    const createAlertsTable = `
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT DEFAULT '{}',
        read BOOLEAN NOT NULL DEFAULT 0,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (device_id) REFERENCES devices (device_id)
      )
    `;
    
    db.run(createAlertsTable, (err) => {
      if (err) {
        console.error('❌ Error creando tabla alerts:', err.message);
        reject(err);
        return;
      }
      
      console.log('✅ Tabla alerts lista');
      resolve();
    });
  });
}

/**
 * 📊 Crear índices para optimizar consultas
 */
function createIndexes() {
  return new Promise((resolve, reject) => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id)',
      'CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type)',
      'CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(active)',
      'CREATE INDEX IF NOT EXISTS idx_readings_device_id ON readings(device_id)',
      'CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_readings_type ON readings(type)',
      'CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id)',
      'CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read)',
      'CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp)'
    ];
    
    let completed = 0;
    
    indexes.forEach(indexSQL => {
      db.run(indexSQL, (err) => {
        if (err) {
          console.error('❌ Error creando índice:', err.message);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === indexes.length) {
          console.log('✅ Índices IoT creados correctamente');
          resolve();
        }
      });
    });
  });
}

/**
 * 🌱 Crear dispositivos de muestra para desarrollo
 */
async function createSampleDevices() {
  try {
    // Verificar si ya existen dispositivos
    const existingDevices = await getAllDevices({ limit: 1 });
    if (existingDevices.length > 0) {
      console.log('🌱 Dispositivos IoT de muestra ya existen');
      return;
    }
    
    const sampleDevices = [
      {
        name: 'Lector NFC Entrada Principal',
        type: 'nfc_reader',
        device_id: 'NFC-ENTRANCE-001',
        location: 'Entrada Principal',
        configuration: JSON.stringify({
          range: '5cm',
          frequency: '13.56MHz',
          protocols: ['ISO14443A', 'ISO14443B']
        })
      },
      {
        name: 'Lector NFC Almacén',
        type: 'nfc_reader',
        device_id: 'NFC-STORAGE-001',
        location: 'Área de Almacenamiento',
        configuration: JSON.stringify({
          range: '5cm',
          frequency: '13.56MHz'
        })
      },
      {
        name: 'Sensor Temperatura Área Fría',
        type: 'temperature_sensor',
        device_id: 'TEMP-COLD-001',
        location: 'Área Refrigerada',
        configuration: JSON.stringify({
          min_temp: -5,
          max_temp: 5,
          unit: 'celsius',
          alert_threshold: 2
        })
      },
      {
        name: 'Sensor Humedad Depósito General',
        type: 'humidity_sensor',
        device_id: 'HUM-MAIN-001',
        location: 'Depósito General',
        configuration: JSON.stringify({
          min_humidity: 40,
          max_humidity: 60,
          unit: 'percentage'
        })
      },
      {
        name: 'Sensor Temperatura Oficinas',
        type: 'temperature_sensor',
        device_id: 'TEMP-OFFICE-001',
        location: 'Área de Oficinas',
        configuration: JSON.stringify({
          min_temp: 18,
          max_temp: 26,
          unit: 'celsius'
        })
      }
    ];
    
    for (const device of sampleDevices) {
      await createDevice({
        ...device,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    console.log('🌱 Dispositivos IoT de muestra creados');
  } catch (error) {
    console.error('❌ Error creando dispositivos de muestra:', error.message);
  }
}

/**
 * ➕ Crear un nuevo dispositivo IoT
 * @param {Object} deviceData - Datos del dispositivo
 * @returns {Promise<number>} ID del dispositivo creado
 */
function createDevice(deviceData) {
  return new Promise((resolve, reject) => {
    const {
      name,
      type,
      device_id,
      location,
      active = true,
      configuration = '{}',
      created_at,
      updated_at
    } = deviceData;
    
    const sql = `
      INSERT INTO devices (
        name, type, device_id, location, active, 
        configuration, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      name, type, device_id, location, active,
      typeof configuration === 'string' ? configuration : JSON.stringify(configuration),
      created_at, updated_at
    ], function(err) {
      if (err) {
        console.error('❌ Error creando dispositivo:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Dispositivo creado con ID: ${this.lastID}`);
      resolve(this.lastID);
    });
  });
}

/**
 * 📱 Obtener todos los dispositivos con filtros
 * @param {Object} options - Opciones de filtro
 * @returns {Promise<Array>} Lista de dispositivos
 */
function getAllDevices(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      type,
      location,
      active,
      device_id,
      limit = 100
    } = options;
    
    // Construir consulta SQL dinámicamente
    let sql = 'SELECT * FROM devices WHERE 1=1';
    const params = [];
    
    // Aplicar filtros
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    
    if (active !== undefined) {
      sql += ' AND active = ?';
      params.push(active ? 1 : 0);
    }
    
    if (device_id) {
      sql += ' AND device_id = ?';
      params.push(device_id);
    }
    
    // Ordenar y limitar
    sql += ' ORDER BY name ASC LIMIT ?';
    params.push(limit);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Error obteniendo dispositivos:', err.message);
        reject(err);
        return;
      }
      
      // Convertir campos y parsear JSON
      const devices = rows.map(row => ({
        ...row,
        active: Boolean(row.active),
        configuration: (() => {
          try {
            return JSON.parse(row.configuration);
          } catch {
            return {};
          }
        })()
      }));
      
      console.log(`📱 Se encontraron ${devices.length} dispositivos`);
      resolve(devices);
    });
  });
}

/**
 * 🔍 Buscar dispositivo por ID de base de datos
 * @param {number} id - ID de base de datos
 * @returns {Promise<Object|null>} Datos del dispositivo o null
 */
function getDeviceById(id) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM devices WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        console.error('❌ Error buscando dispositivo por ID:', err.message);
        reject(err);
        return;
      }
      
      if (row) {
        const device = {
          ...row,
          active: Boolean(row.active),
          configuration: (() => {
            try {
              return JSON.parse(row.configuration);
            } catch {
              return {};
            }
          })()
        };
        console.log(`🔍 Dispositivo encontrado: ${device.name}`);
        resolve(device);
      } else {
        console.log(`🔍 Dispositivo no encontrado con ID: ${id}`);
        resolve(null);
      }
    });
  });
}

/**
 * 🔄 Actualizar un dispositivo
 * @param {number} id - ID del dispositivo
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
function updateDevice(id, updateData) {
  return new Promise((resolve, reject) => {
    // Construir consulta SQL dinámicamente
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'name', 'type', 'device_id', 'location', 'active', 
      'configuration', 'updated_at'
    ];
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        let value = updateData[key];
        
        // Convertir configuration a JSON string si es necesario
        if (key === 'configuration' && typeof value === 'object') {
          value = JSON.stringify(value);
        }
        
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      reject(new Error('No hay campos válidos para actualizar'));
      return;
    }
    
    values.push(id);
    const sql = `UPDATE devices SET ${fields.join(', ')} WHERE id = ?`;
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('❌ Error actualizando dispositivo:', err.message);
        reject(err);
        return;
      }
      
      if (this.changes > 0) {
        console.log(`✅ Dispositivo actualizado ID: ${id}`);
        resolve(true);
      } else {
        console.log(`🔍 Dispositivo no encontrado para actualizar ID: ${id}`);
        resolve(false);
      }
    });
  });
}

/**
 * 🗑️ Eliminar dispositivo
 * @param {number} id - ID del dispositivo
 * @param {boolean} hard - true para eliminación física
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
function deleteDevice(id, hard = false) {
  return new Promise((resolve, reject) => {
    let sql, params;
    
    if (hard) {
      // Eliminación física
      sql = 'DELETE FROM devices WHERE id = ?';
      params = [id];
    } else {
      // Eliminación lógica
      sql = 'UPDATE devices SET active = 0, updated_at = ? WHERE id = ?';
      params = [new Date().toISOString(), id];
    }
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Error eliminando dispositivo:', err.message);
        reject(err);
        return;
      }
      
      if (this.changes > 0) {
        const action = hard ? 'eliminado físicamente' : 'desactivado';
        console.log(`✅ Dispositivo ${action} ID: ${id}`);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * 📊 Crear una nueva lectura de dispositivo
 * @param {Object} readingData - Datos de la lectura
 * @returns {Promise<number>} ID de la lectura creada
 */
function createReading(readingData) {
  return new Promise((resolve, reject) => {
    const {
      device_id,
      type,
      data,
      timestamp
    } = readingData;
    
    const sql = `
      INSERT INTO readings (device_id, type, data, timestamp)
      VALUES (?, ?, ?, ?)
    `;
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    db.run(sql, [device_id, type, dataString, timestamp], function(err) {
      if (err) {
        console.error('❌ Error creando lectura:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Lectura creada con ID: ${this.lastID}`);
      resolve(this.lastID);
    });
  });
}

/**
 * 📊 Obtener lecturas con filtros
 * @param {Object} options - Opciones de filtro
 * @returns {Promise<Array>} Lista de lecturas
 */
function getReadings(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      device_id,
      type,
      limit = 50,
      hours = 24
    } = options;
    
    // Calcular timestamp de hace X horas
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    let sql = `
      SELECT r.*, d.name as device_name, d.location 
      FROM readings r
      LEFT JOIN devices d ON r.device_id = d.device_id
      WHERE r.timestamp >= ?
    `;
    const params = [hoursAgo];
    
    // Aplicar filtros
    if (device_id) {
      sql += ' AND r.device_id = ?';
      params.push(device_id);
    }
    
    if (type) {
      sql += ' AND r.type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY r.timestamp DESC LIMIT ?';
    params.push(limit);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Error obteniendo lecturas:', err.message);
        reject(err);
        return;
      }
      
      // Parsear datos JSON
      const readings = rows.map(row => ({
        ...row,
        data: (() => {
          try {
            return JSON.parse(row.data);
          } catch {
            return row.data;
          }
        })()
      }));
      
      console.log(`📊 Se encontraron ${readings.length} lecturas`);
      resolve(readings);
    });
  });
}

/**
 * 🚨 Crear una nueva alerta
 * @param {Object} alertData - Datos de la alerta
 * @returns {Promise<number>} ID de la alerta creada
 */
function createAlert(alertData) {
  return new Promise((resolve, reject) => {
    const {
      device_id,
      type,
      severity,
      message,
      data = {},
      timestamp
    } = alertData;
    
    const sql = `
      INSERT INTO alerts (device_id, type, severity, message, data, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    db.run(sql, [device_id, type, severity, message, dataString, timestamp], function(err) {
      if (err) {
        console.error('❌ Error creando alerta:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Alerta creada con ID: ${this.lastID}`);
      resolve(this.lastID);
    });
  });
}

/**
 * 🚨 Obtener alertas con filtros
 * @param {Object} options - Opciones de filtro
 * @returns {Promise<Array>} Lista de alertas
 */
function getAlerts(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      device_id,
      severity,
      read,
      limit = 50
    } = options;
    
    let sql = `
      SELECT a.*, d.name as device_name, d.location 
      FROM alerts a
      LEFT JOIN devices d ON a.device_id = d.device_id
      WHERE 1=1
    `;
    const params = [];
    
    // Aplicar filtros
    if (device_id) {
      sql += ' AND a.device_id = ?';
      params.push(device_id);
    }
    
    if (severity) {
      sql += ' AND a.severity = ?';
      params.push(severity);
    }
    
    if (read !== undefined) {
      sql += ' AND a.read = ?';
      params.push(read ? 1 : 0);
    }
    
    sql += ' ORDER BY a.timestamp DESC LIMIT ?';
    params.push(limit);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Error obteniendo alertas:', err.message);
        reject(err);
        return;
      }
      
      // Parsear datos JSON y convertir campos
      const alerts = rows.map(row => ({
        ...row,
        read: Boolean(row.read),
        data: (() => {
          try {
            return JSON.parse(row.data);
          } catch {
            return {};
          }
        })()
      }));
      
      console.log(`🚨 Se encontraron ${alerts.length} alertas`);
      resolve(alerts);
    });
  });
}

/**
 * ✅ Marcar alerta como leída
 * @param {number} alertId - ID de la alerta
 * @returns {Promise<boolean>} true si se marcó correctamente
 */
function markAlertAsRead(alertId) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE alerts SET read = 1 WHERE id = ?';
    
    db.run(sql, [alertId], function(err) {
      if (err) {
        console.error('❌ Error marcando alerta como leída:', err.message);
        reject(err);
        return;
      }
      
      if (this.changes > 0) {
        console.log(`✅ Alerta marcada como leída ID: ${alertId}`);
        resolve(true);
      } else {
        console.log(`🔍 Alerta no encontrada ID: ${alertId}`);
        resolve(false);
      }
    });
  });
}

/**
 * 📊 Obtener estadísticas de dispositivos e IoT
 * @returns {Promise<Object>} Estadísticas generales
 */
function getDeviceStats() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM devices) as total_devices,
        (SELECT COUNT(*) FROM devices WHERE active = 1) as active_devices,
        (SELECT COUNT(*) FROM devices WHERE active = 0) as inactive_devices,
        (SELECT COUNT(DISTINCT type) FROM devices) as device_types,
        (SELECT COUNT(*) FROM readings WHERE timestamp >= datetime('now', '-24 hours')) as readings_24h,
        (SELECT COUNT(*) FROM readings WHERE timestamp >= datetime('now', '-1 hour')) as readings_1h,
        (SELECT COUNT(*) FROM alerts) as total_alerts,
        (SELECT COUNT(*) FROM alerts WHERE read = 0) as unread_alerts,
        (SELECT COUNT(*) FROM alerts WHERE timestamp >= datetime('now', '-24 hours')) as alerts_24h
    `;
    
    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('❌ Error obteniendo estadísticas:', err.message);
        reject(err);
        return;
      }
      
      console.log('📊 Estadísticas IoT obtenidas');
      resolve(row);
    });
  });
}

/**
 * 🔒 Cerrar conexión a la base de datos
 */
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('❌ Error cerrando base de datos IoT:', err.message);
      } else {
        console.log('✅ Conexión a base de datos IoT cerrada');
      }
    });
  }
}

// 🛑 Cerrar base de datos al terminar el proceso
process.on('SIGINT', () => {
  closeDatabase();
});

process.on('SIGTERM', () => {
  closeDatabase();
});

// 📤 Exportar funciones
module.exports = {
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
};
