# 🔐 Servicio de Autenticación - Auth Service

Este servicio maneja la autenticación y autorización de usuarios en nuestro sistema de almacén.

## 🎯 Propósito Didáctico

Este servicio demuestra cómo:
- ✅ Crear un servicio de autenticación con JWT
- ✅ Manejar usuarios con SQLite (base de datos simple)
- ✅ Implementar endpoints OpenAPI
- ✅ Validar y encriptar contraseñas
- ✅ Documentar APIs de forma clara

## 🚀 Funcionalidades

### Endpoints Principales:
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado
- `GET /api/auth/verify` - Verificar si un token es válido
- `GET /health` - Estado del servicio

## 📊 Datos de Prueba

El servicio crea automáticamente un usuario de prueba:
- **Username**: `admin`
- **Password**: `123456`
- **Email**: `admin@almacen.com`

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar el servicio
npm start

# Ejecutar en modo desarrollo (con nodemon)
npm run dev
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t auth-service .

# Ejecutar contenedor
docker run -p 3001:3001 auth-service
```

## 🧪 Pruebas

### Registrar un nuevo usuario:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario1",
    "password": "mipassword",
    "email": "usuario1@email.com"
  }'
```

### Iniciar sesión:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }'
```

### Obtener perfil (requiere token):
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 📋 Estructura de Archivos

```
auth-service/
├── index.js          # Servidor principal con todos los endpoints
├── database.js       # Manejo de SQLite y operaciones de usuarios
├── package.json      # Dependencias y scripts
├── Dockerfile        # Configuración para Docker
└── README.md         # Esta documentación
```

## 🔒 Seguridad

- Las contraseñas se encriptan con `bcryptjs`
- Los tokens JWT expiran en 24 horas
- Validación de datos de entrada
- Headers de seguridad básicos

## 🌐 Variables de Entorno

El servicio utiliza estas variables de entorno (con valores por defecto):

```env
PORT=3001                    # Puerto del servicio
JWT_SECRET=mi-secreto-ultra-seguro  # Secreto para JWT
NODE_ENV=development         # Entorno de ejecución
```

## 📚 Conceptos Aprendidos

Al estudiar este servicio aprenderás sobre:

1. **Autenticación JWT**: Cómo generar y validar tokens
2. **Base de datos SQLite**: Operaciones CRUD básicas
3. **Express.js**: Creación de APIs REST
4. **Middleware**: Validación de tokens y datos
5. **Encriptación**: Protección de contraseñas
6. **OpenAPI**: Documentación automática de APIs
7. **Docker**: Containerización de aplicaciones
8. **Manejo de errores**: Respuestas HTTP apropiadas

## 🔗 Integración

Este servicio se conecta con:
- **API Gateway** (puerto 3000): Recibe peticiones enrutadas
- **Otros servicios**: A través de validación de tokens

## 📖 Documentación de la API

Una vez que el servicio esté ejecutándose, puedes ver la documentación completa de la API en:
- http://localhost:3001/api-docs (Swagger UI)

¡Perfecto para aprender cómo funcionan las APIs en un microservicio real! 🎓
