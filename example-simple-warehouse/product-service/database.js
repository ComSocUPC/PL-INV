/**
 * 💾 Database - Manejo de Base de Datos Simple con SQLite para Productos
 * 
 * Este archivo maneja todas las operaciones de base de datos para productos.
 * Incluye funciones CRUD completas y búsquedas avanzadas.
 * 
 * 🎯 Objetivo didáctico: Entender operaciones avanzadas de base de datos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 📂 Ubicación de la base de datos
const DB_PATH = path.join(__dirname, 'warehouse_products.db');

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
      
      // Crear la tabla de productos si no existe
      const createProductTable = `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          code TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          price REAL NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          min_stock INTEGER NOT NULL DEFAULT 5,
          unit TEXT NOT NULL DEFAULT 'unidad',
          active BOOLEAN NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `;
      
      db.run(createProductTable, (err) => {
        if (err) {
          console.error('❌ Error creando tabla products:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Tabla products lista');
        
        // Crear índices para mejorar rendimiento
        createIndexes()
          .then(() => {
            // Insertar productos de prueba si no existen
            return createSampleProducts();
          })
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
 * 📊 Crear índices para mejorar el rendimiento de las consultas
 */
async function createIndexes() {
  return new Promise((resolve, reject) => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_code ON products(code)',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_active ON products(active)',
      'CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)'
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
          console.log('✅ Índices creados correctamente');
          resolve();
        }
      });
    });
  });
}

/**
 * 🌱 Crear productos de muestra para desarrollo
 */
async function createSampleProducts() {
  try {
    // Verificar si ya existen productos
    const existingProducts = await getAllProducts({ limit: 1 });
    if (existingProducts.length > 0) {
      console.log('🌱 Productos de muestra ya existen');
      return;
    }
    
    const sampleProducts = [
      {
        name: 'Laptop Dell Inspiron 15',
        description: 'Laptop con procesador Intel i7, 8GB RAM, 512GB SSD',
        code: 'LAP-DELL-001',
        category: 'Electrónicos',
        price: 899.99,
        stock: 15,
        min_stock: 3,
        unit: 'unidad'
      },
      {
        name: 'Silla de Oficina Ergonómica',
        description: 'Silla ajustable con soporte lumbar y reposabrazos',
        code: 'SIL-ERG-001',
        category: 'Mobiliario',
        price: 159.99,
        stock: 25,
        min_stock: 5,
        unit: 'unidad'
      },
      {
        name: 'Papel Bond A4',
        description: 'Resma de 500 hojas, papel blanco de 75g/m²',
        code: 'PAP-A4-500',
        category: 'Papelería',
        price: 4.50,
        stock: 100,
        min_stock: 20,
        unit: 'paquete'
      },
      {
        name: 'Monitor LED 24 pulgadas',
        description: 'Monitor Full HD con conexión HDMI y VGA',
        code: 'MON-LED-24',
        category: 'Electrónicos',
        price: 189.99,
        stock: 8,
        min_stock: 2,
        unit: 'unidad'
      },
      {
        name: 'Café Premium 1kg',
        description: 'Café tostado en grano, origen colombiano',
        code: 'CAF-PREM-1K',
        category: 'Alimentos',
        price: 12.99,
        stock: 50,
        min_stock: 10,
        unit: 'kg'
      }
    ];
    
    for (const product of sampleProducts) {
      await createProduct({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    console.log('🌱 Productos de muestra creados');
  } catch (error) {
    console.error('❌ Error creando productos de muestra:', error.message);
  }
}

/**
 * ➕ Crear un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<number>} ID del producto creado
 */
function createProduct(productData) {
  return new Promise((resolve, reject) => {
    const {
      name,
      description,
      code,
      category,
      price,
      stock,
      min_stock,
      unit,
      active = true,
      created_at,
      updated_at
    } = productData;
    
    const sql = `
      INSERT INTO products (
        name, description, code, category, price, stock, 
        min_stock, unit, active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      name, description, code, category, price, stock,
      min_stock, unit, active, created_at, updated_at
    ], function(err) {
      if (err) {
        console.error('❌ Error creando producto:', err.message);
        reject(err);
        return;
      }
      
      console.log(`✅ Producto creado con ID: ${this.lastID}`);
      resolve(this.lastID);
    });
  });
}

/**
 * 📋 Obtener todos los productos con paginación y filtros
 * @param {Object} options - Opciones de consulta
 * @returns {Promise<Array>} Lista de productos
 */
function getAllProducts(options = {}) {
  return new Promise((resolve, reject) => {
    const {
      page = 1,
      limit = 10,
      category,
      active = true,
      sort = 'name',
      order = 'asc'
    } = options;
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Construir consulta SQL dinámicamente
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    // Aplicar filtros
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (active !== undefined) {
      sql += ' AND active = ?';
      params.push(active ? 1 : 0);
    }
    
    // Aplicar ordenamiento
    const validSortFields = ['name', 'code', 'category', 'price', 'stock', 'created_at'];
    const validOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sort) && validOrders.includes(order.toLowerCase())) {
      sql += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    } else {
      sql += ' ORDER BY name ASC';
    }
    
    // Aplicar paginación
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Error obteniendo productos:', err.message);
        reject(err);
        return;
      }
      
      // Convertir campos numéricos y boolean
      const products = rows.map(row => ({
        ...row,
        active: Boolean(row.active),
        price: parseFloat(row.price)
      }));
      
      console.log(`📋 Se encontraron ${products.length} productos`);
      resolve(products);
    });
  });
}

/**
 * 🔍 Buscar producto por ID
 * @param {number} productId - ID del producto
 * @returns {Promise<Object|null>} Datos del producto o null si no existe
 */
function getProductById(productId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM products WHERE id = ?';
    
    db.get(sql, [productId], (err, row) => {
      if (err) {
        console.error('❌ Error buscando producto por ID:', err.message);
        reject(err);
        return;
      }
      
      if (row) {
        const product = {
          ...row,
          active: Boolean(row.active),
          price: parseFloat(row.price)
        };
        console.log(`🔍 Producto encontrado: ${product.name}`);
        resolve(product);
      } else {
        console.log(`🔍 Producto no encontrado con ID: ${productId}`);
        resolve(null);
      }
    });
  });
}

/**
 * 🔍 Buscar producto por código
 * @param {string} code - Código del producto
 * @returns {Promise<Object|null>} Datos del producto o null si no existe
 */
function getProductByCode(code) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM products WHERE code = ?';
    
    db.get(sql, [code], (err, row) => {
      if (err) {
        console.error('❌ Error buscando producto por código:', err.message);
        reject(err);
        return;
      }
      
      if (row) {
        const product = {
          ...row,
          active: Boolean(row.active),
          price: parseFloat(row.price)
        };
        console.log(`🔍 Producto encontrado: ${product.name}`);
        resolve(product);
      } else {
        console.log(`🔍 Producto no encontrado con código: ${code}`);
        resolve(null);
      }
    });
  });
}

/**
 * 🔎 Buscar productos por texto
 * @param {string} query - Texto a buscar
 * @param {Object} options - Opciones de búsqueda
 * @returns {Promise<Array>} Lista de productos encontrados
 */
function searchProducts(query, options = {}) {
  return new Promise((resolve, reject) => {
    const { category, limit = 20 } = options;
    
    // Búsqueda en nombre, descripción y código
    let sql = `
      SELECT * FROM products 
      WHERE active = 1 
      AND (
        name LIKE ? OR 
        description LIKE ? OR 
        code LIKE ?
      )
    `;
    
    const searchTerm = `%${query}%`;
    const params = [searchTerm, searchTerm, searchTerm];
    
    // Filtrar por categoría si se especifica
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY name ASC LIMIT ?';
    params.push(limit);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ Error buscando productos:', err.message);
        reject(err);
        return;
      }
      
      // Convertir campos numéricos y boolean
      const products = rows.map(row => ({
        ...row,
        active: Boolean(row.active),
        price: parseFloat(row.price)
      }));
      
      console.log(`🔎 Búsqueda "${query}": ${products.length} resultados`);
      resolve(products);
    });
  });
}

/**
 * 📊 Obtener productos por categoría
 * @param {string} category - Categoría a filtrar
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Array>} Lista de productos de la categoría
 */
function getProductsByCategory(category, options = {}) {
  return new Promise((resolve, reject) => {
    const { limit = 20 } = options;
    
    const sql = `
      SELECT * FROM products 
      WHERE category = ? AND active = 1
      ORDER BY name ASC
      LIMIT ?
    `;
    
    db.all(sql, [category, limit], (err, rows) => {
      if (err) {
        console.error('❌ Error obteniendo productos por categoría:', err.message);
        reject(err);
        return;
      }
      
      // Convertir campos numéricos y boolean
      const products = rows.map(row => ({
        ...row,
        active: Boolean(row.active),
        price: parseFloat(row.price)
      }));
      
      console.log(`📊 Categoría "${category}": ${products.length} productos`);
      resolve(products);
    });
  });
}

/**
 * 🔄 Actualizar un producto
 * @param {number} productId - ID del producto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
function updateProduct(productId, updateData) {
  return new Promise((resolve, reject) => {
    // Construir consulta SQL dinámicamente
    const fields = [];
    const values = [];
    
    const allowedFields = [
      'name', 'description', 'code', 'category', 'price', 
      'stock', 'min_stock', 'unit', 'active', 'updated_at'
    ];
    
    // Solo actualizar campos permitidos que están presentes
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      reject(new Error('No hay campos válidos para actualizar'));
      return;
    }
    
    // Agregar ID al final de los parámetros
    values.push(productId);
    
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('❌ Error actualizando producto:', err.message);
        reject(err);
        return;
      }
      
      if (this.changes > 0) {
        console.log(`✅ Producto actualizado ID: ${productId}`);
        resolve(true);
      } else {
        console.log(`🔍 Producto no encontrado para actualizar ID: ${productId}`);
        resolve(false);
      }
    });
  });
}

/**
 * 📦 Actualizar solo el stock de un producto
 * @param {number} productId - ID del producto
 * @param {number} newStock - Nuevo valor de stock
 * @returns {Promise<boolean>} true si se actualizó correctamente
 */
function updateStock(productId, newStock) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE products 
      SET stock = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const now = new Date().toISOString();
    
    db.run(sql, [newStock, now, productId], function(err) {
      if (err) {
        console.error('❌ Error actualizando stock:', err.message);
        reject(err);
        return;
      }
      
      if (this.changes > 0) {
        console.log(`✅ Stock actualizado ID: ${productId} -> ${newStock}`);
        resolve(true);
      } else {
        console.log(`🔍 Producto no encontrado para actualizar stock ID: ${productId}`);
        resolve(false);
      }
    });
  });
}

/**
 * 🗑️ Eliminar producto (físico o lógico)
 * @param {number} productId - ID del producto
 * @param {boolean} hard - true para eliminación física, false para lógica
 * @returns {Promise<boolean>} true si se eliminó correctamente
 */
function deleteProduct(productId, hard = false) {
  return new Promise((resolve, reject) => {
    let sql, params;
    
    if (hard) {
      // Eliminación física (irreversible)
      sql = 'DELETE FROM products WHERE id = ?';
      params = [productId];
    } else {
      // Eliminación lógica (marcar como inactivo)
      sql = 'UPDATE products SET active = 0, updated_at = ? WHERE id = ?';
      params = [new Date().toISOString(), productId];
    }
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Error eliminando producto:', err.message);
        reject(err);
        return;
      }
      
      if (this.changes > 0) {
        const action = hard ? 'eliminado físicamente' : 'desactivado';
        console.log(`✅ Producto ${action} ID: ${productId}`);
        resolve(true);
      } else {
        console.log(`🔍 Producto no encontrado para eliminar ID: ${productId}`);
        resolve(false);
      }
    });
  });
}

/**
 * 📊 Obtener estadísticas de productos
 * @returns {Promise<Object>} Estadísticas generales
 */
function getProductStats() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_products,
        COUNT(CASE WHEN active = 0 THEN 1 END) as inactive_products,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_products,
        COUNT(DISTINCT category) as categories,
        SUM(CASE WHEN active = 1 THEN stock * price ELSE 0 END) as total_inventory_value,
        AVG(CASE WHEN active = 1 THEN price ELSE NULL END) as average_price,
        MIN(CASE WHEN active = 1 THEN stock ELSE NULL END) as min_stock_level,
        MAX(CASE WHEN active = 1 THEN stock ELSE NULL END) as max_stock_level
      FROM products
    `;
    
    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('❌ Error obteniendo estadísticas:', err.message);
        reject(err);
        return;
      }
      
      // Formatear números
      const stats = {
        ...row,
        total_inventory_value: parseFloat(row.total_inventory_value || 0).toFixed(2),
        average_price: parseFloat(row.average_price || 0).toFixed(2)
      };
      
      console.log('📊 Estadísticas obtenidas');
      resolve(stats);
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
  createProduct,
  getAllProducts,
  getProductById,
  getProductByCode,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getProductStats,
  updateStock,
  closeDatabase
};
