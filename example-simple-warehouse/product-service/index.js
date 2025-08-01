/**
 * 🛍️ Servicio de Productos - Product Service
 * 
 * Este microservicio maneja todo lo relacionado con el catálogo de productos
 * del almacén. Es un ejemplo didáctico de cómo estructurar un servicio REST.
 * 
 * 🎯 Objetivo didáctico: 
 * - Entender CRUD completo (Create, Read, Update, Delete)
 * - Manejar validaciones de datos
 * - Implementar búsqueda y filtros
 * - Documentar con OpenAPI/Swagger
 * 
 * 🔗 Puerto: 3002
 * 💾 Base de datos: SQLite (warehouse_products.db)
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

// 📝 Importar funciones de base de datos
const {
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
} = require('./database');

// 🚀 Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3002;

console.log('🛍️ Iniciando Servicio de Productos...');

// 🛡️ Middlewares de seguridad y utilidad
app.use(helmet()); // Headers de seguridad
app.use(cors()); // Permitir peticiones desde otros dominios
app.use(compression()); // Comprimir respuestas para ahorrar ancho de banda
app.use(morgan('combined')); // Logs de peticiones HTTP

// 📦 Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🚦 Rate limiting: máximo 100 peticiones por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones
  message: {
    error: 'Demasiadas peticiones, intenta de nuevo en 15 minutos'
  }
});
app.use(limiter);

// 📊 Configuración de Swagger/OpenAPI
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '🛍️ Product Service API',
      version: '1.0.0',
      description: `
        # Servicio de Productos - API REST
        
        Este servicio maneja el catálogo completo de productos del almacén.
        
        ## Funcionalidades:
        - ✅ CRUD completo de productos
        - ✅ Búsqueda por texto y filtros
        - ✅ Gestión de stock
        - ✅ Categorización de productos
        - ✅ Códigos únicos de producto
        
        ## Base de datos:
        - SQLite (warehouse_products.db)
        - Tablas: products
        
        ## Ejemplos de uso:
        - Crear producto
        - Buscar productos
        - Actualizar stock
        - Filtrar por categoría
      `,
      contact: {
        name: 'Proyecto COMSOC',
        email: 'admin@almacen.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Servidor de desarrollo'
      }
    ],
    tags: [
      {
        name: 'products',
        description: 'Operaciones con productos'
      },
      {
        name: 'search',
        description: 'Búsqueda y filtros'
      },
      {
        name: 'stock',
        description: 'Gestión de inventario'
      },
      {
        name: 'health',
        description: 'Estado del servicio'
      }
    ]
  },
  apis: ['./index.js'] // Archivos que contienen documentación OpenAPI
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 📚 Ruta para documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '🛍️ Product Service API'
}));

// 🏥 Esquemas de validación con Joi
const productSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  
  description: Joi.string().max(500).allow('').optional()
    .messages({
      'string.max': 'La descripción no puede tener más de 500 caracteres'
    }),
  
  code: Joi.string().min(3).max(20).required()
    .messages({
      'string.min': 'El código debe tener al menos 3 caracteres',
      'string.max': 'El código no puede tener más de 20 caracteres',
      'any.required': 'El código es obligatorio'
    }),
  
  category: Joi.string().min(2).max(50).required()
    .messages({
      'string.min': 'La categoría debe tener al menos 2 caracteres',
      'string.max': 'La categoría no puede tener más de 50 caracteres',
      'any.required': 'La categoría es obligatoria'
    }),
  
  price: Joi.number().positive().precision(2).required()
    .messages({
      'number.positive': 'El precio debe ser mayor a 0',
      'any.required': 'El precio es obligatorio'
    }),
  
  stock: Joi.number().integer().min(0).required()
    .messages({
      'number.min': 'El stock no puede ser negativo',
      'any.required': 'El stock es obligatorio'
    }),
  
  min_stock: Joi.number().integer().min(0).optional().default(5)
    .messages({
      'number.min': 'El stock mínimo no puede ser negativo'
    }),
  
  unit: Joi.string().valid('unidad', 'kg', 'litro', 'metro', 'caja', 'paquete').default('unidad')
    .messages({
      'any.only': 'La unidad debe ser: unidad, kg, litro, metro, caja o paquete'
    }),
  
  active: Joi.boolean().default(true)
});

const updateProductSchema = productSchema.fork(['name', 'code', 'category', 'price', 'stock'], 
  (schema) => schema.optional()
);

const stockUpdateSchema = Joi.object({
  stock: Joi.number().integer().min(0).required()
    .messages({
      'number.min': 'El stock no puede ser negativo',
      'any.required': 'El stock es obligatorio'
    })
});

/**
 * 🏥 Health Check - Verificar estado del servicio
 */
app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a base de datos obteniendo estadísticas
    const stats = await getProductStats();
    
    res.status(200).json({
      status: 'healthy',
      service: 'product-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        total_products: stats.total_products,
        active_products: stats.active_products,
        categories: stats.categories
      }
    });
  } catch (error) {
    console.error('❌ Error en health check:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      service: 'product-service',
      error: 'Database connection failed'
    });
  }
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [health]
 *     summary: 🏥 Verificar estado del servicio
 *     description: Endpoint para monitoreo de salud del servicio
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 service:
 *                   type: string
 *                   example: product-service
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Servicio no disponible
 */

/**
 * 📋 Obtener todos los productos
 */
app.get('/api/products', async (req, res) => {
  try {
    console.log('📋 Obteniendo lista de productos...');
    
    // Parámetros de consulta opcionales
    const { 
      page = 1, 
      limit = 10, 
      category, 
      active = 'true',
      sort = 'name',
      order = 'asc'
    } = req.query;
    
    // Validar parámetros
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: 'Parámetros de paginación inválidos',
        details: 'page >= 1, limit entre 1 y 100'
      });
    }
    
    const products = await getAllProducts({
      page: pageNum,
      limit: limitNum,
      category,
      active: active === 'true',
      sort,
      order
    });
    
    console.log(`✅ Se encontraron ${products.length} productos`);
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        has_more: products.length === limitNum
      },
      filters: {
        category,
        active: active === 'true',
        sort,
        order
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudieron obtener los productos'
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [products]
 *     summary: 📋 Obtener lista de productos
 *     description: Obtiene todos los productos con paginación y filtros opcionales
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Productos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filtrar productos activos/inactivos
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */

/**
 * 🔍 Obtener producto por ID
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Buscando producto con ID: ${id}`);
    
    // Validar que el ID sea un número
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        details: 'El ID debe ser un número entero'
      });
    }
    
    const product = await getProductById(parseInt(id));
    
    if (!product) {
      console.log(`❌ Producto no encontrado: ${id}`);
      return res.status(404).json({
        error: 'Producto no encontrado',
        details: `No existe un producto con ID ${id}`
      });
    }
    
    console.log(`✅ Producto encontrado: ${product.name}`);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Error obteniendo producto:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo obtener el producto'
    });
  }
});

/**
 * 🔍 Obtener producto por código
 */
app.get('/api/products/code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    console.log(`🔍 Buscando producto con código: ${code}`);
    
    const product = await getProductByCode(code);
    
    if (!product) {
      console.log(`❌ Producto no encontrado: ${code}`);
      return res.status(404).json({
        error: 'Producto no encontrado',
        details: `No existe un producto con código ${code}`
      });
    }
    
    console.log(`✅ Producto encontrado: ${product.name}`);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Error obteniendo producto por código:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo obtener el producto'
    });
  }
});

/**
 * 🔎 Buscar productos
 */
app.get('/api/products/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { category, limit = 20 } = req.query;
    
    console.log(`🔎 Buscando productos: "${query}"`);
    
    // Validar query mínimo
    if (query.length < 2) {
      return res.status(400).json({
        error: 'Query muy corto',
        details: 'La búsqueda debe tener al menos 2 caracteres'
      });
    }
    
    const products = await searchProducts(query, {
      category,
      limit: Math.min(parseInt(limit), 50) // Máximo 50 resultados
    });
    
    console.log(`✅ Se encontraron ${products.length} productos`);
    
    res.status(200).json({
      success: true,
      data: products,
      search: {
        query,
        category,
        results: products.length
      }
    });
  } catch (error) {
    console.error('❌ Error buscando productos:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo realizar la búsqueda'
    });
  }
});

/**
 * 📊 Obtener productos por categoría
 */
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    
    console.log(`📊 Obteniendo productos de categoría: ${category}`);
    
    const products = await getProductsByCategory(category, {
      limit: Math.min(parseInt(limit), 50)
    });
    
    console.log(`✅ Se encontraron ${products.length} productos en ${category}`);
    
    res.status(200).json({
      success: true,
      data: products,
      category,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo productos por categoría:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudieron obtener los productos'
    });
  }
});

/**
 * ➕ Crear nuevo producto
 */
app.post('/api/products', async (req, res) => {
  try {
    console.log('➕ Creando nuevo producto...');
    
    // Validar datos de entrada
    const { error, value } = productSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Datos inválidos:', error.details[0].message);
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details[0].message,
        field: error.details[0].path[0]
      });
    }
    
    // Verificar que el código no exista
    const existingProduct = await getProductByCode(value.code);
    if (existingProduct) {
      return res.status(409).json({
        error: 'Código duplicado',
        details: `Ya existe un producto con el código ${value.code}`
      });
    }
    
    // Crear producto
    const productId = await createProduct({
      ...value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // Obtener el producto creado
    const newProduct = await getProductById(productId);
    
    console.log(`✅ Producto creado: ${newProduct.name} (ID: ${productId})`);
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct
    });
  } catch (error) {
    console.error('❌ Error creando producto:', error.message);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        error: 'Código duplicado',
        details: 'Ya existe un producto con este código'
      });
    }
    
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo crear el producto'
    });
  }
});

/**
 * 🔄 Actualizar producto
 */
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Actualizando producto ID: ${id}`);
    
    // Validar ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        details: 'El ID debe ser un número entero'
      });
    }
    
    // Verificar que el producto existe
    const existingProduct = await getProductById(parseInt(id));
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        details: `No existe un producto con ID ${id}`
      });
    }
    
    // Validar datos de entrada
    const { error, value } = updateProductSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Datos inválidos:', error.details[0].message);
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details[0].message,
        field: error.details[0].path[0]
      });
    }
    
    // Si se está cambiando el código, verificar que no exista
    if (value.code && value.code !== existingProduct.code) {
      const codeExists = await getProductByCode(value.code);
      if (codeExists) {
        return res.status(409).json({
          error: 'Código duplicado',
          details: `Ya existe un producto con el código ${value.code}`
        });
      }
    }
    
    // Actualizar producto
    await updateProduct(parseInt(id), {
      ...value,
      updated_at: new Date().toISOString()
    });
    
    // Obtener producto actualizado
    const updatedProduct = await getProductById(parseInt(id));
    
    console.log(`✅ Producto actualizado: ${updatedProduct.name}`);
    
    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo actualizar el producto'
    });
  }
});

/**
 * 📦 Actualizar stock del producto
 */
app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📦 Actualizando stock del producto ID: ${id}`);
    
    // Validar ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        details: 'El ID debe ser un número entero'
      });
    }
    
    // Verificar que el producto existe
    const existingProduct = await getProductById(parseInt(id));
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        details: `No existe un producto con ID ${id}`
      });
    }
    
    // Validar datos de entrada
    const { error, value } = stockUpdateSchema.validate(req.body);
    
    if (error) {
      console.log('❌ Datos inválidos:', error.details[0].message);
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details[0].message
      });
    }
    
    // Actualizar stock
    await updateStock(parseInt(id), value.stock);
    
    // Obtener producto actualizado
    const updatedProduct = await getProductById(parseInt(id));
    
    console.log(`✅ Stock actualizado: ${updatedProduct.name} (${value.stock} ${updatedProduct.unit})`);
    
    // Verificar si está bajo el stock mínimo
    const lowStock = updatedProduct.stock <= updatedProduct.min_stock;
    
    res.status(200).json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: updatedProduct,
      alerts: lowStock ? [{
        type: 'low_stock',
        message: `⚠️ Stock bajo: ${updatedProduct.stock} ${updatedProduct.unit} (mínimo: ${updatedProduct.min_stock})`
      }] : []
    });
  } catch (error) {
    console.error('❌ Error actualizando stock:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo actualizar el stock'
    });
  }
});

/**
 * 🗑️ Eliminar producto (soft delete)
 */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hard = false } = req.query;
    
    console.log(`🗑️ Eliminando producto ID: ${id} (hard: ${hard})`);
    
    // Validar ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID inválido',
        details: 'El ID debe ser un número entero'
      });
    }
    
    // Verificar que el producto existe
    const existingProduct = await getProductById(parseInt(id));
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        details: `No existe un producto con ID ${id}`
      });
    }
    
    if (hard === 'true') {
      // Eliminación física (irreversible)
      await deleteProduct(parseInt(id), true);
      console.log(`✅ Producto eliminado permanentemente: ${existingProduct.name}`);
      
      res.status(200).json({
        success: true,
        message: 'Producto eliminado permanentemente',
        data: { id: parseInt(id), name: existingProduct.name }
      });
    } else {
      // Eliminación lógica (marcar como inactivo)
      await updateProduct(parseInt(id), {
        active: false,
        updated_at: new Date().toISOString()
      });
      
      console.log(`✅ Producto desactivado: ${existingProduct.name}`);
      
      res.status(200).json({
        success: true,
        message: 'Producto desactivado exitosamente',
        data: { id: parseInt(id), name: existingProduct.name, active: false }
      });
    }
  } catch (error) {
    console.error('❌ Error eliminando producto:', error.message);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: 'No se pudo eliminar el producto'
    });
  }
});

/**
 * 📊 Obtener estadísticas de productos
 */
app.get('/api/products/stats/summary', async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de productos...');
    
    const stats = await getProductStats();
    
    console.log('✅ Estadísticas obtenidas');
    
    res.status(200).json({
      success: true,
      data: stats,
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

/**
 * 🚫 Middleware para rutas no encontradas
 */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    details: `La ruta ${req.method} ${req.originalUrl} no existe`,
    available_endpoints: [
      'GET /health',
      'GET /api/products',
      'GET /api/products/:id',
      'GET /api/products/code/:code',
      'GET /api/products/search/:query',
      'GET /api/products/category/:category',
      'GET /api/products/stats/summary',
      'POST /api/products',
      'PUT /api/products/:id',
      'PATCH /api/products/:id/stock',
      'DELETE /api/products/:id',
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
    details: 'Ocurrió un error inesperado',
    timestamp: new Date().toISOString()
  });
});

/**
 * 🚀 Iniciar el servidor
 */
async function startServer() {
  try {
    // Inicializar base de datos
    console.log('💾 Inicializando base de datos...');
    await initDatabase();
    
    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`
🚀 ========================================
   🛍️  PRODUCT SERVICE INICIADO
========================================
🌐 URL: http://localhost:${PORT}
📚 Docs: http://localhost:${PORT}/api-docs
🏥 Health: http://localhost:${PORT}/health
📦 Productos: http://localhost:${PORT}/api/products
========================================
      `);
    });
    
    // Manejar cierre graceful
    process.on('SIGTERM', () => {
      console.log('🛑 Recibido SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor HTTP cerrado');
        closeDatabase();
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 Recibido SIGINT, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor HTTP cerrado');
        closeDatabase();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('💥 Error fatal iniciando el servidor:', error);
    process.exit(1);
  }
}

// 🎬 Iniciar todo
startServer().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - category
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto
 *           example: 1
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nombre del producto
 *           example: "Laptop Dell Inspiron"
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Descripción detallada del producto
 *           example: "Laptop con procesador Intel i7, 8GB RAM, 256GB SSD"
 *         code:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *           description: Código único del producto
 *           example: "LAP-DELL-001"
 *         category:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Categoría del producto
 *           example: "Electrónicos"
 *         price:
 *           type: number
 *           minimum: 0.01
 *           description: Precio del producto
 *           example: 899.99
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: Cantidad disponible en stock
 *           example: 15
 *         min_stock:
 *           type: integer
 *           minimum: 0
 *           description: Stock mínimo antes de alerta
 *           example: 5
 *         unit:
 *           type: string
 *           enum: [unidad, kg, litro, metro, caja, paquete]
 *           description: Unidad de medida
 *           example: "unidad"
 *         active:
 *           type: boolean
 *           description: Si el producto está activo
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */
