const jwt = require('jsonwebtoken');
const redis = require('redis');
const logger = require('../utils/logger');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debe proporcionar un token válido en el header Authorization'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar si el token está en la blacklist
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token ha sido revocado'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar si el usuario está activo (opcional - consultar cache)
    const userCache = await redisClient.get(`user:${decoded.userId}`);
    if (userCache) {
      const userData = JSON.parse(userCache);
      if (!userData.active) {
        return res.status(401).json({
          error: 'Usuario inactivo',
          message: 'La cuenta de usuario ha sido desactivada'
        });
      }
    }

    // Añadir información del usuario a la request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    // Log de acceso
    logger.info(`Acceso autorizado: ${decoded.email} - ${req.method} ${req.originalUrl}`);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, debe autenticarse nuevamente'
      });
    }

    logger.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error de autenticación',
      message: 'Error interno en la verificación del token'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    const userRole = req.user.role;
    const hasRequiredRole = Array.isArray(requiredRoles) 
      ? requiredRoles.includes(userRole)
      : userRole === requiredRoles;

    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Requiere rol: ${Array.isArray(requiredRoles) ? requiredRoles.join(' o ') : requiredRoles}`
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tiene permisos suficientes'
      });
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Requiere permiso: ${requiredPermission}`
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission
};
