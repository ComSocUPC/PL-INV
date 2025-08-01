/**
 * 🔐 Auth Service - Servicio de Autenticación Simple
 * 
 * Este microservicio se encarga de:
 * 1. Registrar nuevos usuarios
 * 2. Autenticar usuarios existentes
 * 3. Generar tokens JWT
 * 4. Validar tokens JWT
 * 
 * 🎯 Objetivo didáctico: Entender cómo funciona la autenticación en microservicios
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const { initDatabase, createUser, getUserByUsername, getUserById } = require('./database');

// 📚 Configuración básica del servidor
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mi-secreto-super-seguro-para-desarrollo';

// 🔒 Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());

// 📊 Inicializar base de datos
initDatabase();

console.log('🔐 Auth Service configurado correctamente');

// 🏥 Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'up',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    message: '🔐 Servicio de autenticación funcionando'
  });
});

// 📖 Documentación del servicio
app.get('/docs', (req, res) => {
  res.send(`
    <html>
      <head><title>🔐 Auth Service - Documentación</title></head>
      <body>
        <h1>🔐 Servicio de Autenticación</h1>
        <p>Este microservicio maneja la autenticación de usuarios usando JWT (JSON Web Tokens).</p>
        
        <h2>🔗 Endpoints Disponibles:</h2>
        
        <h3>📝 Registro de Usuario</h3>
        <pre>
POST /register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "mipassword",
  "email": "usuario@ejemplo.com"
}
        </pre>
        
        <h3>🚪 Login</h3>
        <pre>
POST /login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "mipassword"
}
        </pre>
        
        <h3>✅ Verificar Token</h3>
        <pre>
POST /verify
Content-Type: application/json
Authorization: Bearer [tu-token-jwt]

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
        </pre>
        
        <h2>🎯 Conceptos Educativos:</h2>
        <ul>
          <li><strong>JWT (JSON Web Token):</strong> Tokens seguros para autenticación</li>
          <li><strong>Bcrypt:</strong> Encriptación segura de contraseñas</li>
          <li><strong>SQLite:</strong> Base de datos simple para desarrollo</li>
          <li><strong>Middleware:</strong> Funciones que se ejecutan antes de las rutas</li>
        </ul>
      </body>
    </html>
  `);
});

// 📝 Registro de nuevos usuarios
app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 🛡️ Validaciones básicas
    if (!username || !password) {
      return res.status(400).json({
        error: 'Faltan datos requeridos',
        message: 'Username y password son obligatorios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password muy corto',
        message: 'El password debe tener al menos 6 caracteres'
      });
    }

    console.log(`📝 Intento de registro para usuario: ${username}`);

    // 🔍 Verificar si el usuario ya existe
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: `El usuario ${username} ya está registrado`
      });
    }

    // 🔒 Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 💾 Crear el usuario en la base de datos
    const userId = await createUser({
      username,
      password: hashedPassword,
      email: email || null,
      created_at: new Date().toISOString()
    });

    console.log(`✅ Usuario registrado exitosamente: ${username} (ID: ${userId})`);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: userId,
        username: username,
        email: email || null
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el usuario'
    });
  }
});

// 🚪 Login de usuarios
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🛡️ Validaciones básicas
    if (!username || !password) {
      return res.status(400).json({
        error: 'Faltan datos requeridos',
        message: 'Username y password son obligatorios'
      });
    }

    console.log(`🚪 Intento de login para usuario: ${username}`);

    // 🔍 Buscar el usuario en la base de datos
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // 🔐 Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // 🎫 Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email
      },
      JWT_SECRET,
      { 
        expiresIn: '24h' // El token expira en 24 horas
      }
    );

    console.log(`✅ Login exitoso para usuario: ${username}`);

    res.json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo procesar el login'
    });
  }
});

// ✅ Verificar token JWT
app.post('/verify', async (req, res) => {
  try {
    // 🎫 Obtener token del header Authorization o del body
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7); // Remover 'Bearer ' del inicio
    } else {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Token no proporcionado',
        message: 'Se requiere un token JWT para verificar'
      });
    }

    console.log('🔍 Verificando token JWT...');

    // 🔐 Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔍 Buscar el usuario para asegurar que aún existe
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El usuario asociado al token no existe'
      });
    }

    console.log(`✅ Token válido para usuario: ${user.username}`);

    res.json({
      valid: true,
      message: 'Token válido',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token JWT ha expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token JWT no es válido'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo verificar el token'
    });
  }
});

// 👥 Listar usuarios (solo para propósitos educativos)
app.get('/users', (req, res) => {
  res.json({
    message: '👥 Lista de usuarios no implementada',
    reason: 'Por seguridad, no exponemos la lista de usuarios',
    suggestion: 'En un sistema real, esto requeriría permisos de administrador'
  });
});

// 🚫 Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en el Auth Service`,
    available_routes: [
      'POST /register',
      'POST /login', 
      'POST /verify',
      'GET /health',
      'GET /docs'
    ]
  });
});

// 🚨 Manejo global de errores
app.use((error, req, res, next) => {
  console.error('🚨 Error no manejado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Algo salió mal en el Auth Service'
  });
});

// 🚀 Iniciar el servidor
app.listen(PORT, () => {
  console.log(`
🔐 Auth Service iniciado correctamente

📊 Información del servicio:
   Puerto: ${PORT}
   Base de datos: SQLite (archivo local)
   JWT Secret: ${JWT_SECRET.substring(0, 10)}...
   
🔗 Endpoints principales:
   Registro: POST /register
   Login: POST /login
   Verificar: POST /verify
   Documentación: GET /docs
   
🎯 Objetivo educativo:
   Este servicio demuestra cómo manejar autenticación
   en microservicios usando JWT y encriptación segura.
   
📚 Para aprender más, visita: http://localhost:${PORT}/docs
  `);
});

// 🛑 Manejo elegante del cierre del servidor
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando Auth Service...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando Auth Service...');
  process.exit(0);
});
