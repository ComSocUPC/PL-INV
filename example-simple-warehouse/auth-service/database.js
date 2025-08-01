/**
 * 💾 Database - Manejo de Base de Datos Simple con SQLite
 * 
 * Este archivo maneja todas las operaciones de base de datos para usuarios.
 * Usamos SQLite porque es simple y no requiere instalación adicional.
 * 
 * 🎯 Objetivo didáctico: Entender operaciones básicas de base de datos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 📂 Ubicación de la base de datos
const DB_PATH = path.join(__dirname, 'warehouse_auth.db');

console.log(`💾 Base de datos SQLite en: ${DB_PATH}`);

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
      
      console.log('✅ Conectado a la base de datos SQLite');
      
      // Crear la tabla de usuarios si no existe
      const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT,
          created_at TEXT NOT NULL,
          last_login TEXT
        )
      `;
      
      db.run(createUserTable, (err) => {
        if (err) {
          console.error('❌ Error creando tabla users:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Tabla users lista');
        
        // Insertar usuario de prueba si no existe
        createDefaultUser()
          .then(() => {
            console.log('✅ Base de datos inicializada correctamente');
            resolve();
          })
          .catch(reject);
      });
    });
  });
}

/**
 * 👤 Crear usuario por defecto para pruebas
 */
async function createDefaultUser() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Verificar si ya existe el usuario admin
    const existingAdmin = await getUserByUsername('admin');
    if (existingAdmin) {
      console.log('👤 Usuario admin ya existe');
      return;
    }
    
    // Crear usuario admin por defecto
    const hashedPassword = await bcrypt.hash('123456', 10);
    await createUser({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@almacen.com',
      created_at: new Date().toISOString()
    });
    
    console.log('👤 Usuario admin creado (username: admin, password: 123456)');
  } catch (error) {
    console.error('❌ Error creando usuario por defecto:', error.message);
  }
}

/**
 * ➕ Crear un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.username - Nombre de usuario
 * @param {string} userData.password - Contraseña encriptada
 * @param {string} userData.email - Email (opcional)
 * @param {string} userData.created_at - Fecha de creación
 * @returns {Promise<number>} ID del usuario creado
 */
function createUser(userData) {
  return new Promise((resolve, reject) => {
    const { username, password, email, created_at } = userData;
    
    const sql = `
      INSERT INTO users (username, password, email, created_at)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(sql, [username, password, email, created_at], function(err) {
      if (err) {
        console.error('❌ Error creando usuario:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Usuario creado con ID: ${this.lastID}`);
      resolve(this.lastID);
    });
  });
}

/**
 * 🔍 Buscar usuario por nombre de usuario
 * @param {string} username - Nombre de usuario
 * @returns {Promise<Object|null>} Datos del usuario o null si no existe
 */
function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    
    db.get(sql, [username], (err, row) => {
      if (err) {
        console.error('❌ Error buscando usuario:', err.message);
        reject(err);
        return;
      }
      
      if (row) {
        console.log(`🔍 Usuario encontrado: ${username}`);
      } else {
        console.log(`🔍 Usuario no encontrado: ${username}`);
      }
      
      resolve(row || null);
    });
  });
}

/**
 * 🔍 Buscar usuario por ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object|null>} Datos del usuario o null si no existe
 */
function getUserById(userId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    
    db.get(sql, [userId], (err, row) => {
      if (err) {
        console.error('❌ Error buscando usuario por ID:', err.message);
        reject(err);
        return;
      }
      
      resolve(row || null);
    });
  });
}

/**
 * 🔄 Actualizar último login
 * @param {number} userId - ID del usuario
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
function updateLastLogin(userId) {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET last_login = ? WHERE id = ?';
    const now = new Date().toISOString();
    
    db.run(sql, [now, userId], function(err) {
      if (err) {
        console.error('❌ Error actualizando último login:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Último login actualizado para usuario ID: ${userId}`);
      resolve(true);
    });
  });
}

/**
 * 📊 Obtener estadísticas de usuarios
 * @returns {Promise<Object>} Estadísticas básicas
 */
function getUserStats() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as users_with_login,
        MAX(created_at) as last_registration
      FROM users
    `;
    
    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('❌ Error obteniendo estadísticas:', err.message);
        reject(err);
        return;
      }
      
      resolve(row);
    });
  });
}

/**
 * 🗑️ Eliminar usuario (solo para desarrollo/testing)
 * @param {string} username - Nombre de usuario
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
function deleteUser(username) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM users WHERE username = ?';
    
    db.run(sql, [username], function(err) {
      if (err) {
        console.error('❌ Error eliminando usuario:', err.message);
        reject(err);
        return;
      }
      
      if (this.changes > 0) {
        console.log(`🗑️ Usuario eliminado: ${username}`);
        resolve(true);
      } else {
        console.log(`🔍 Usuario no encontrado para eliminar: ${username}`);
        resolve(false);
      }
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
        console.error('❌ Error cerrando base de datos:', err.message);
      } else {
        console.log('✅ Conexión a base de datos cerrada');
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
  createUser,
  getUserByUsername,
  getUserById,
  updateLastLogin,
  getUserStats,
  deleteUser,
  closeDatabase
};
