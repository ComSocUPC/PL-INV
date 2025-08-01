const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Esquemas de validación
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('admin', 'manager', 'operator', 'viewer').default('operator')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const { email, password, firstName, lastName, role } = value;

    // Verificar si el usuario ya existe
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario con este email'
      });
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const userId = uuidv4();
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db('users').insert(newUser);

    // Log de registro
    logger.info(`Usuario registrado: ${email} con rol ${role}`);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role,
        active: true
      }
    });

  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el usuario'
    });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.details.map(d => d.message)
      });
    }

    const { email, password } = value;

    // Buscar usuario
    const user = await db('users').where({ email, active: true }).first();
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn(`Intento de login fallido para: ${email}`);
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: await getUserPermissions(user.role)
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Guardar información del usuario en cache
    await redis.setex(`user:${user.id}`, 3600, JSON.stringify({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      active: user.active,
      lastLogin: new Date()
    }));

    // Actualizar último login
    await db('users').where({ id: user.id }).update({
      last_login: new Date(),
      updated_at: new Date()
    });

    logger.info(`Login exitoso: ${email}`);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar el login'
    });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.substring(7);
    
    // Añadir token a blacklist
    const decoded = jwt.decode(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await redis.setex(`blacklist:${token}`, expiresIn, 'true');
    }

    // Remover usuario del cache
    await redis.del(`user:${req.user.userId}`);

    logger.info(`Logout: ${req.user.email}`);

    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar el logout'
    });
  }
});

// Perfil del usuario
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'active', 'created_at', 'last_login')
      .where({ id: req.user.userId })
      .first();

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        active: user.active,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    logger.error('Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Verificar token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Función auxiliar para obtener permisos por rol
async function getUserPermissions(role) {
  const permissions = {
    admin: ['*'], // Todos los permisos
    manager: [
      'products.read', 'products.write', 'products.delete',
      'inventory.read', 'inventory.write',
      'reports.read', 'users.read'
    ],
    operator: [
      'products.read', 'products.write',
      'inventory.read', 'inventory.write'
    ],
    viewer: [
      'products.read',
      'inventory.read',
      'reports.read'
    ]
  };

  return permissions[role] || [];
}

module.exports = router;
