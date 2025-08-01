/**
 * 📡 API Gateway Simple - Ejemplo Educativo
 * 
 * Este es el punto de entrada principal de nuestro sistema de microservicios.
 * Su función es:
 * 1. Recibir todas las peticiones HTTP
 * 2. Enrutarlas al microservicio correspondiente
 * 3. Devolver las respuestas al cliente
 * 
 * 🎯 Objetivo didáctico: Entender cómo funciona un API Gateway básico
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const axios = require('axios');

// 📚 Configuración básica del servidor
const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Middleware de seguridad básica
app.use(helmet()); // Añade headers de seguridad
app.use(cors()); // Permite peticiones desde cualquier origen
app.use(express.json()); // Parse JSON en el body

// ⚡ Rate limiting simple (máximo 100 requests por 15 minutos)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas peticiones, intenta de nuevo en 15 minutos'
  }
});
app.use(limiter);

// 📊 URLs de los microservicios (en un proyecto real, estas estarían en variables de entorno)
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  products: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  iot: process.env.IOT_SERVICE_URL || 'http://iot-service:3003'
};

console.log('🔗 Servicios configurados:', SERVICES);

// 🏥 Health Check - Verifica que el API Gateway esté funcionando
app.get('/health', async (req, res) => {
  try {
    // Verificamos el estado de todos los microservicios
    const healthChecks = await Promise.allSettled([
      axios.get(`${SERVICES.auth}/health`).catch(() => ({ status: 'down' })),
      axios.get(`${SERVICES.products}/health`).catch(() => ({ status: 'down' })),
      axios.get(`${SERVICES.iot}/health`).catch(() => ({ status: 'down' }))
    ]);

    const serviceStatus = {
      gateway: 'up',
      auth: healthChecks[0].status === 'fulfilled' ? 'up' : 'down',
      products: healthChecks[1].status === 'fulfilled' ? 'up' : 'down',
      iot: healthChecks[2].status === 'fulfilled' ? 'up' : 'down'
    };

    res.json({
      status: 'up',
      timestamp: new Date().toISOString(),
      services: serviceStatus,
      message: '🏥 API Gateway funcionando correctamente'
    });
  } catch (error) {
    console.error('❌ Error en health check:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error verificando el estado de los servicios'
    });
  }
});

// 📖 Documentación de la API
app.get('/docs', (req, res) => {
  res.send(`
    <html>
      <head><title>📚 API Documentation - Simple Warehouse</title></head>
      <body>
        <h1>📚 Documentación de APIs - Almacén Simple</h1>
        <p>Este es un ejemplo educativo de microservicios para gestión de almacén.</p>
        
        <h2>🔗 Servicios Disponibles:</h2>
        <ul>
          <li><strong>🔐 Auth Service:</strong> <a href="/api/auth/docs">Documentación de Autenticación</a></li>
          <li><strong>📦 Product Service:</strong> <a href="/api/products/docs">Documentación de Productos</a></li>
          <li><strong>🔌 IoT Service:</strong> <a href="/api/iot/docs">Documentación de IoT</a></li>
        </ul>
        
        <h2>🧪 Ejemplos de Uso:</h2>
        <pre>
# 1. Verificar estado del sistema
curl http://localhost:3000/health

# 2. Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"test","password":"123456"}'

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"test","password":"123456"}'

# 4. Listar productos
curl http://localhost:3000/api/products

# 5. Simular sensor IoT
curl http://localhost:3000/api/iot/sensors/temperature
        </pre>
        
        <p><strong>🎯 Objetivo Educativo:</strong> Este ejemplo muestra cómo los microservicios se comunican através de un API Gateway.</p>
      </body>
    </html>
  `);
});

// 🔐 Rutas de Autenticación - Proxy al Auth Service
app.use('/api/auth', async (req, res) => {
  try {
    console.log(`🔐 Reenviando petición de auth: ${req.method} ${req.path}`);
    
    const response = await axios({
      method: req.method,
      url: `${SERVICES.auth}${req.path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error en auth service:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Auth service no disponible',
        message: 'El servicio de autenticación no responde'
      });
    }
  }
});

// 📦 Rutas de Productos - Proxy al Product Service
app.use('/api/products', async (req, res) => {
  try {
    console.log(`📦 Reenviando petición de productos: ${req.method} ${req.path}`);
    
    const response = await axios({
      method: req.method,
      url: `${SERVICES.products}${req.path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error en product service:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'Product service no disponible',
        message: 'El servicio de productos no responde'
      });
    }
  }
});

// 🔌 Rutas de IoT - Proxy al IoT Service
app.use('/api/iot', async (req, res) => {
  try {
    console.log(`🔌 Reenviando petición de IoT: ${req.method} ${req.path}`);
    
    const response = await axios({
      method: req.method,
      url: `${SERVICES.iot}${req.path}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error en IoT service:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        error: 'IoT service no disponible',
        message: 'El servicio de IoT no responde'
      });
    }
  }
});

// 🏠 Ruta principal - Página de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Bienvenido al Almacén Simple - Ejemplo Educativo',
    description: 'Sistema de microservicios para gestión básica de almacén con IoT',
    version: '1.0.0',
    services: {
      auth: 'Autenticación de usuarios',
      products: 'Gestión de productos',
      iot: 'Sensores y dispositivos IoT'
    },
    documentation: '/docs',
    health_check: '/health',
    timestamp: new Date().toISOString()
  });
});

// 🚫 Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`,
    available_routes: [
      '/health',
      '/docs',
      '/api/auth/*',
      '/api/products/*',
      '/api/iot/*'
    ]
  });
});

// 🚨 Manejo global de errores
app.use((error, req, res, next) => {
  console.error('🚨 Error no manejado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Algo salió mal en el API Gateway'
  });
});

// 🚀 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`
🚀 API Gateway Simple iniciado correctamente

📊 Información del servidor:
   Puerto: ${PORT}
   Entorno: ${process.env.NODE_ENV || 'development'}
   
🔗 URLs principales:
   Inicio: http://localhost:${PORT}
   Documentación: http://localhost:${PORT}/docs
   Health Check: http://localhost:${PORT}/health
   
🎯 Objetivo educativo:
   Este API Gateway demuestra cómo enrutar peticiones 
   a diferentes microservicios de forma simple y clara.
   
📚 Para aprender más, visita: http://localhost:${PORT}/docs
  `);
});

// 🛑 Manejo elegante del cierre del servidor
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando API Gateway...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando API Gateway...');
  process.exit(0);
});
