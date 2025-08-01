const express = require('express');
const redis = require('redis');
const router = express.Router();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    dependencies: {}
  };

  try {
    // Verificar conexión a Redis
    await redisClient.ping();
    health.dependencies.redis = {
      status: 'healthy',
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    };
  } catch (error) {
    health.dependencies.redis = {
      status: 'unhealthy',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Verificar conectividad con servicios backend
  const services = [
    { name: 'auth-service', url: process.env.AUTH_SERVICE_URL },
    { name: 'product-service', url: process.env.PRODUCT_SERVICE_URL },
    { name: 'inventory-service', url: process.env.INVENTORY_SERVICE_URL },
    { name: 'iot-service', url: process.env.IOT_SERVICE_URL }
  ];

  for (const service of services) {
    try {
      const axios = require('axios');
      await axios.get(`${service.url}/health`, { timeout: 5000 });
      health.dependencies[service.name] = {
        status: 'healthy',
        url: service.url
      };
    } catch (error) {
      health.dependencies[service.name] = {
        status: 'unhealthy',
        url: service.url,
        error: error.message
      };
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 
                     health.status === 'degraded' ? 206 : 503;

  res.status(statusCode).json(health);
});

module.exports = router;
