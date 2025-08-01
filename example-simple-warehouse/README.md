# 🎓 Proyecto Educativo: Sistema de Almacén con Microservicios

¡Bienvenido al proyecto educativo más completo para aprender microservicios, IoT y OpenAPI! 🚀

## 🎯 ¿Qué aprenderás?

### 🏗️ **Arquitectura de Microservicios:**
- Separación de responsabilidades
- Comunicación entre servicios
- API Gateway como punto de entrada
- Escalabilidad horizontal

### 🌐 **Tecnologías IoT:**
- Simulación de dispositivos NFC
- WebSockets para tiempo real
- Sensores de temperatura
- Eventos y notificaciones

### 📋 **Estándares OpenAPI:**
- Documentación automática
- Contratos de API
- Validación de datos
- Testing automatizado

### 🐳 **Containerización:**
- Docker para cada servicio
- Docker Compose para orquestación
- Redes y volúmenes
- Escalado de servicios

## 🚀 Inicio Rápido (5 minutos)

### **1. Requisitos previos:**
```bash
# Verificar Docker
docker --version
docker-compose --version
```

### **2. Ejecutar el proyecto:**
```bash
# Clonar y navegar
cd example-simple-warehouse

# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### **3. Explorar el sistema:**
- **🌐 API Principal**: http://localhost:3000
- **📚 Documentación**: http://localhost:3000/api-docs
- **🔐 Auth Service**: http://localhost:3001/api-docs
- **🛍️ Product Service**: http://localhost:3002/api-docs
- **🌐 IoT Service**: http://localhost:3003/api-docs

### **4. Probar funcionalidades:**
```bash
# 1. Autenticarse
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'

# 2. Ver productos
curl http://localhost:3000/api/products

# 3. Simular dispositivo IoT
curl -X POST http://localhost:3000/api/iot/simulate/nfc \
  -H "Content-Type: application/json" \
  -d '{"device_id": "NFC-ENTRANCE-001"}'
```

## 🎓 Guías de Aprendizaje

### 📖 **Nivel 1: Fundamentos**
1. [**Introducción a Microservicios**](docs/ARCHITECTURE.md#microservicios-explicados)
   - ¿Qué son los microservicios?
   - Ventajas y desventajas
   - Cuándo usarlos

2. [**Configuración del Entorno**](docs/DEVELOPMENT.md#configuración-del-entorno-de-desarrollo)
   - Instalación de herramientas
   - Configuración de IDE
   - Primeros pasos

### 📖 **Nivel 2: Desarrollo**
1. [**Creando tu Primer Microservicio**](auth-service/README.md)
   - Estructura del proyecto
   - API REST básica
   - Validación de datos

2. [**Comunicación entre Servicios**](api-gateway/README.md)
   - API Gateway pattern
   - Proxy de requests
   - Manejo de errores

3. [**Base de Datos y Persistencia**](product-service/README.md)
   - SQLite para desarrollo
   - Modelos de datos
   - Migraciones

### 📖 **Nivel 3: IoT y Tiempo Real**
1. [**Dispositivos IoT Simulados**](iot-service/README.md)
   - Simulador NFC
   - Sensores de temperatura
   - Eventos en tiempo real

2. [**WebSockets y Comunicación**](iot-service/README.md#websockets)
   - Servidor WebSocket
   - Cliente JavaScript
   - Broadcasting de eventos

### 📖 **Nivel 4: Documentación y Testing**
1. [**OpenAPI y Swagger**](docs/ARCHITECTURE.md#openapi-y-documentación)
   - Especificaciones OpenAPI
   - Documentación automática
   - Testing de APIs

2. [**Testing Automatizado**](docs/DEVELOPMENT.md#testing-y-calidad)
   - Tests unitarios
   - Tests de integración
   - Cobertura de código

### 📖 **Nivel 5: Despliegue y Operaciones**
1. [**Docker y Containerización**](docs/DEPLOYMENT.md)
   - Dockerfile por servicio
   - Docker Compose
   - Redes y volúmenes

2. [**Monitoreo y Logging**](docs/DEVELOPMENT.md#debugging-y-logging)
   - Logs estructurados
   - Health checks
   - Métricas básicas

## 🛠️ Ejercicios Prácticos

### 🏃‍♂️ **Ejercicio 1: Tu Primer Microservicio**
**Objetivo**: Crear un nuevo microservicio para gestionar proveedores.

**Pasos**:
1. Crear carpeta `supplier-service`
2. Configurar `package.json` y dependencias
3. Implementar CRUD básico:
   - GET `/api/suppliers` - Listar proveedores
   - POST `/api/suppliers` - Crear proveedor
   - GET `/api/suppliers/:id` - Obtener proveedor
   - PUT `/api/suppliers/:id` - Actualizar proveedor
   - DELETE `/api/suppliers/:id` - Eliminar proveedor

**Criterios de Éxito**:
- [ ] API funcional con todas las operaciones
- [ ] Validación de datos con Joi
- [ ] Documentación OpenAPI
- [ ] Tests unitarios básicos
- [ ] Dockerfile funcional

**Código Base**:
```javascript
// supplier-service/src/index.js
const express = require('express');
const supplierRoutes = require('./routes/suppliers');

const app = express();
app.use(express.json());
app.use('/api/suppliers', supplierRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🏭 Supplier Service running on port ${PORT}`);
});
```

### 🏃‍♂️ **Ejercicio 2: Integración IoT Personalizada**
**Objetivo**: Agregar un nuevo tipo de sensor (humedad).

**Pasos**:
1. Modificar `iot-service/src/simulator/iotSimulator.js`
2. Agregar método `simulateHumidity()`
3. Crear endpoint para simular humedad
4. Actualizar WebSocket para nuevos eventos

**Criterios de Éxito**:
- [ ] Simulador de humedad funcional
- [ ] Eventos WebSocket para humedad
- [ ] API REST para simular
- [ ] Logs apropiados

### 🏃‍♂️ **Ejercicio 3: Frontend Simple**
**Objetivo**: Crear una página web que muestre eventos IoT en tiempo real.

**Pasos**:
1. Crear carpeta `frontend`
2. HTML básico con lista de eventos
3. JavaScript para WebSocket
4. CSS para styling básico
5. Dockerizar el frontend

**Criterios de Éxito**:
- [ ] Página web funcional
- [ ] Conexión WebSocket
- [ ] Mostrar eventos en tiempo real
- [ ] Responsive design básico

## 🔍 Casos de Estudio

### 📊 **Caso 1: Escalabilidad**
**Problema**: El servicio de productos está recibiendo muchas peticiones.

**Solución**: Escalar horizontalmente con Docker Compose:
```bash
# Escalar a 3 instancias
docker-compose up -d --scale product-service=3

# Verificar balanceador de carga
curl http://localhost:3000/api/products
```

**Aprendizajes**:
- Load balancing automático
- Distribución de carga
- Monitoreo de instancias

### 📊 **Caso 2: Tolerancia a Fallos**
**Problema**: Un servicio falla y afecta a todo el sistema.

**Investigación**:
1. Parar un servicio: `docker-compose stop product-service`
2. Verificar comportamiento del API Gateway
3. Implementar circuit breaker básico

**Aprendizajes**:
- Degradación elegante
- Manejo de errores
- Resiliencia del sistema

### 📊 **Caso 3: Monitoreo y Debugging**
**Problema**: Necesitas encontrar un bug en producción.

**Herramientas**:
```bash
# Ver logs en tiempo real
docker-compose logs -f product-service

# Estadísticas de contenedores
docker stats

# Ejecutar comandos en contenedor
docker exec -it warehouse-product-service sh
```

**Aprendizajes**:
- Debugging en contenedores
- Logs centralizados
- Métricas de performance

## 📚 Recursos Adicionales

### 🔗 **Documentación Oficial**:
- [Node.js](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [Docker](https://docs.docker.com/)
- [OpenAPI](https://swagger.io/specification/)

### 🔗 **Tutoriales Recomendados**:
- [Microservices Patterns](https://microservices.io/)
- [Docker Tutorial](https://docker-curriculum.com/)
- [WebSocket Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

### 🔗 **Herramientas Útiles**:
- [Postman](https://postman.com/) - Testing de APIs
- [VS Code](https://code.visualstudio.com/) - Editor recomendado
- [Docker Desktop](https://docker.com/products/docker-desktop/) - GUI para Docker

## 🎯 Proyecto Final

### 🏆 **Desafío: E-commerce Completo**
**Objetivo**: Expandir el sistema actual a un e-commerce completo.

**Nuevos Microservicios a Implementar**:
1. **Order Service** - Gestión de pedidos
2. **Payment Service** - Procesamiento de pagos
3. **Notification Service** - Emails y notificaciones
4. **Analytics Service** - Métricas y reportes

**Funcionalidades Adicionales**:
- Carrito de compras
- Procesamiento de pagos (simulado)
- Sistema de notificaciones
- Dashboard de analytics
- Frontend completo

**Tecnologías a Explorar**:
- Redis para caché
- PostgreSQL para producción
- RabbitMQ para message queuing
- React para frontend avanzado

### 📝 **Evaluación**:
- **Arquitectura** (25%): Diseño de microservicios
- **Código** (25%): Calidad y buenas prácticas
- **Documentación** (25%): OpenAPI y READMEs
- **Testing** (25%): Cobertura y tipos de tests

## 🤝 Contribuir al Proyecto

### **¿Encontraste un bug?**
1. Crear issue en GitHub
2. Describir el problema
3. Incluir pasos para reproducir

### **¿Quieres agregar una funcionalidad?**
1. Fork del repositorio
2. Crear rama feature
3. Implementar cambios
4. Crear Pull Request

### **¿Quieres mejorar la documentación?**
1. Todas las contribuciones son bienvenidas
2. Especialmente ejemplos y tutoriales
3. Traducciones a otros idiomas

## 📞 Soporte y Comunidad

### **¿Necesitas ayuda?**
- 📧 Email: support@warehouse-system.com
- 💬 Discord: [Warehouse Community](https://discord.gg/warehouse)
- 📱 GitHub Issues: Para bugs y features

### **Recursos de la Comunidad**:
- 📖 Wiki del proyecto
- 🎥 Videos tutoriales
- 📝 Blog con casos de uso
- 🎪 Eventos y workshops

---

## 🏁 ¡Empezar Ahora!

```bash
# 1. Clonar el proyecto
git clone <repository-url>
cd example-simple-warehouse

# 2. Iniciar el sistema
docker-compose up -d

# 3. Abrir documentación
open http://localhost:3000/api-docs

# 4. ¡Empezar a aprender! 🚀
```

**¡Feliz aprendizaje y bienvenido al mundo de los microservicios!** 🎉
