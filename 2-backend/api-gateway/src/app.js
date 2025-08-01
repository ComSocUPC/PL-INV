const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const redis = require('redis');
require('dotenv').config();

const authMiddleware = require('./middleware/auth');
const logger = require('./utils/logger');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.connect().catch(console.error);

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compresión y logging
app.use(compression());
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.use('/health', healthRoutes);

// Configuración de proxies para cada servicio
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    pathRewrite: {
      '^/api/auth': '/api/auth'
    }
  },
  products: {
    target: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: {
      '^/api/products': '/api/products'
    }
  },
  inventory: {
    target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: {
      '^/api/inventory': '/api/inventory'
    }
  },
  iot: {
    target: process.env.IOT_SERVICE_URL || 'http://localhost:3004',
    pathRewrite: {
      '^/api/iot': '/api/iot'
    }
  }
};

// Middleware de autenticación para rutas protegidas
const protectedRoutes = [
  '/api/products',
  '/api/inventory',
  '/api/iot'
];

// Aplicar autenticación a rutas protegidas
protectedRoutes.forEach(route => {
  app.use(route, authMiddleware);
});

// Configurar proxies
Object.keys(services).forEach(serviceName => {
  const service = services[serviceName];
  const routePath = `/api/${serviceName === 'products' ? 'products' : 
                           serviceName === 'inventory' ? 'inventory' : 
                           serviceName === 'iot' ? 'iot' : serviceName}`;
  
  app.use(routePath, createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    pathRewrite: service.pathRewrite,
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, err.message);
      res.status(503).json({
        error: `Servicio ${serviceName} no disponible`,
        message: 'Por favor, intenta de nuevo más tarde'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${service.target}`);
    }
  }));
});

// Ruta por defecto
app.get('/api', (req, res) => {
  res.json({
    message: 'API Gateway del Sistema de Inventario',
    version: '1.0.0',
    services: {
      auth: '/api/auth',
      products: '/api/products',
      inventory: '/api/inventory',
      iot: '/api/iot'
    },
    documentation: '/api/docs'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  logger.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error interno'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  await redisClient.quit();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`API Gateway ejecutándose en puerto ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
