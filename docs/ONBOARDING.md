# 🎉 Welcome to ComSocUPC Inventory Project!

¡Bienvenido al proyecto de inventario con microservicios e IoT! Esta guía te ayudará a configurar tu entorno y empezar a contribuir rápidamente.

## 🚀 Quick Start (5 minutos)

### 1️⃣ **Configuración Inicial**

```bash
# Clonar el repositorio
git clone https://github.com/ComSocUPC/PL-INV.git
cd PL-INV

# Configurar git (si no lo has hecho)
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@upci.edu.pe"
```

## 🎯 Metodología del Proyecto

### 🏆 **Competencia Semanal Entre Equipos**
Este proyecto utiliza una metodología **competitiva y colaborativa**:

- **👥 Equipos**: 4 equipos de 2 personas cada uno
- **⏱️ Ritmo**: 1 microservicio por semana
- **🎯 Challenge**: Todos los equipos implementan el MISMO microservicio
- **🏆 Selección**: Se elige la MEJOR implementación
- **🔄 Integración**: La versión ganadora se integra al proyecto principal

### 📅 **Cronograma de Competencias**
| Semana | Microservicio | Status |
|--------|---------------|--------|
| **1** | 🔐 Auth Service | 🏃‍♂️ En Progreso |
| **2** | 📦 Product Service | ⏳ Próximo |
| **3** | 📊 Inventory Service | ⏳ Próximo |
| **4** | 🔌 IoT Gateway | ⏳ Próximo |

### 🎯 Identificar tu Equipo

| 🎯 Si te gusta... | 👥 Tu equipo es... | 🌿 Tu rama es... |
|-------------------|-------------------|------------------|
| 🎨 Innovar en Frontend/UI | 🐉 **Dragons** | `E1-Dragons-🐉` |
| ⚙️ Optimizar Backend/APIs | 🐙 **Kraken** | `E2-Kraken-🐙` |
| 🔌 Experimentar con IoT | 🔥 **Phoenix** | `E3-Phoenix-🔥` |
| 🛠️ Perfeccionar DevOps | 🦄 **Unicorn** | `E4-Unicorn-🦄` |

**Nota**: Todos los equipos implementan el mismo microservicio, pero cada uno con su enfoque y especialidad única.

### 3️⃣ **Setup de Desarrollo**

```bash
# Cambiar a la rama de tu equipo (ejemplo: Dragons)
git checkout E1-Dragons-🐉
git pull origin E1-Dragons-🐉

# Instalar dependencias (proyecto completo)
npm install

# OR instalar dependencias del proyecto simple
cd example-simple-warehouse
npm install
```

### 4️⃣ **Probar el Proyecto**

#### **Opción A: Proyecto Simple (Recomendado para principiantes)**
```bash
cd example-simple-warehouse

# Iniciar todos los servicios
npm run dev

# En otra terminal - verificar que funciona
curl http://localhost:3000/api/health
```

#### **Opción B: Proyecto Completo**
```bash
# Iniciar con Docker (requiere Docker Desktop)
docker-compose up

# Verificar servicios
curl http://localhost:3000/api/health
```

### 5️⃣ **Tu Primera Contribución**

```bash
# Crear tu primera feature branch
git checkout -b feature/MI-PRIMER-CAMBIO

# Hacer un pequeño cambio (ejemplo: actualizar README)
echo "## Mi Primera Contribución\n- Configuré el entorno exitosamente!" >> ONBOARDING_SUCCESS.md

# Commit y push
git add .
git commit -m "docs: add my first contribution log"
git push origin feature/MI-PRIMER-CAMBIO

# Crear Pull Request
gh pr create --title "docs: my first contribution" --body "Mi primera contribución al proyecto!"
```

---

## 🎯 Onboarding por Equipo

### 🐉 **Dragons Team (Auth Service - Semana 1)**

#### **Setup para Competencia**
```bash
cd 2-backend

# Crear tu implementación de Auth Service
git checkout E1-Dragons-🐉
git pull origin E1-Dragons-🐉

# Crear rama de competencia
git checkout -b competition/week1-auth-service

# Setup inicial
mkdir auth-service-dragons
cd auth-service-dragons
npm init -y
npm install express jsonwebtoken bcryptjs joi helmet cors
npm install -D jest supertest nodemon
```

#### **Tu Primera Tarea Dragons - Auth Service**
```bash
# Crear estructura básica
cat > index.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const joi = require('joi');

const app = express();
app.use(express.json());

// 🐉 Dragons Innovation: Advanced JWT with custom claims
const generateToken = (user) => {
  return jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
    // Dragons special: User preferences in token
    preferences: user.preferences,
    team: 'dragons'
  }, process.env.JWT_SECRET || 'dragons-secret', { expiresIn: '24h' });
};

// Register endpoint with Dragons flair
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // 🐉 Advanced validation
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
      name: joi.string().min(2).max(50).required()
    });
    
    const { error } = schema.validate({ email, password, name });
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    // Dragons innovation: Enhanced security
    const hashedPassword = await bcrypt.hash(password, 12); // Higher salt rounds
    
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      password: hashedPassword,
      role: 'user',
      preferences: { theme: 'dragon', notifications: true }, // Dragons special
      createdAt: new Date()
    };
    
    const token = generateToken(user);
    
    res.status(201).json({
      message: '🐉 User registered successfully by Dragons team!',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🐉 Dragons Auth Service running on port ${PORT}`);
});

module.exports = app;
EOF

# Crear Dockerfile optimizado
cat > Dockerfile << 'EOF'
# 🐉 Dragons Multi-stage build for minimal size
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
USER node
CMD ["node", "index.js"]
EOF

# Crear tests
mkdir tests
cat > tests/auth.test.js << 'EOF'
const request = require('supertest');
const app = require('../index');

describe('🐉 Dragons Auth Service', () => {
  test('POST /api/auth/register should create user with Dragons enhancements', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'dragon@test.com',
        password: 'DragonPass123!',
        name: 'Dragon Warrior'
      })
      .expect(201);
    
    expect(response.body.message).toContain('Dragons team');
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('dragon@test.com');
  });
  
  test('Should enforce Dragons password policy', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'weak@test.com',
        password: 'weak',
        name: 'Test User'
      })
      .expect(400);
    
    expect(response.body.error).toContain('pattern');
  });
});
EOF

# Ejecutar tests
npm test

# Commit inicial
git add .
git commit -m "feat(auth): 🐉 Dragons initial auth service with enhanced security"
git push origin competition/week1-auth-service
```

### 🐙 **Kraken Team (Auth Service - Semana 1)**

#### **Setup para Competencia Kraken**
```bash
# Kraken approach: Database-first, performance-focused
git checkout E2-Kraken-🐙
git checkout -b competition/week1-auth-service

mkdir auth-service-kraken
cd auth-service-kraken
npm init -y
npm install express jsonwebtoken bcryptjs postgresql redis compression helmet morgan
npm install -D jest supertest
```

#### **Tu Primera Tarea Kraken - Database-Optimized Auth**
```bash
# Kraken innovation: PostgreSQL + Redis integration
cat > index.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 🐙 Kraken optimizations
app.use(compression()); // Response compression
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Advanced logging
app.use(express.json({ limit: '10mb' }));

// 🐙 Kraken: Database connection simulation
const users = new Map(); // Simulated PostgreSQL with connection pooling

// 🐙 Kraken: Redis cache simulation
const cache = new Map();

app.post('/api/auth/register', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { email, password, name } = req.body;
    
    // 🐙 Kraken: Advanced performance monitoring
    if (users.has(email)) {
      return res.status(409).json({ 
        error: 'User already exists',
        performance: { responseTime: Date.now() - startTime }
      });
    }
    
    // 🐙 Kraken: Optimized hashing with performance tracking
    const hashStart = Date.now();
    const hashedPassword = await bcrypt.hash(password, 10); // Balanced security/performance
    const hashTime = Date.now() - hashStart;
    
    const user = {
      id: `kraken_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      team: 'kraken'
    };
    
    users.set(email, user);
    
    // 🐙 Kraken: Cache the user for quick access
    cache.set(`user:${user.id}`, user);
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, team: 'kraken' },
      process.env.JWT_SECRET || 'kraken-deep-secret',
      { expiresIn: '24h' }
    );
    
    const responseTime = Date.now() - startTime;
    
    res.status(201).json({
      message: '🐙 User registered by Kraken team - Optimized performance!',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      performance: {
        totalResponseTime: responseTime,
        hashingTime: hashTime,
        cacheStatus: 'stored'
      }
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    res.status(500).json({ 
      error: 'Server error',
      performance: { responseTime }
    });
  }
});

// 🐙 Kraken: Performance monitoring endpoint
app.get('/api/auth/stats', (req, res) => {
  res.json({
    team: '🐙 Kraken',
    users: users.size,
    cacheEntries: cache.size,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🐙 Kraken Auth Service - Performance optimized on port ${PORT}`);
});

module.exports = app;
EOF

# Commit Kraken style
git add .
git commit -m "feat(auth): 🐙 Kraken performance-optimized auth with monitoring"
git push origin competition/week1-auth-service
```

### 🔥 **Phoenix Team (Auth Service - Semana 1)**

#### **Setup para Competencia Phoenix**
```bash
# Phoenix approach: IoT-ready, real-time focused
git checkout E3-Phoenix-🔥
git checkout -b competition/week1-auth-service

mkdir auth-service-phoenix
cd auth-service-phoenix
npm init -y
npm install express jsonwebtoken bcryptjs socket.io mqtt ws
npm install -D jest supertest
```

#### **Tu Primera Tarea Phoenix - IoT-Ready Auth**
```bash
# Phoenix innovation: IoT device authentication
cat > index.js << 'EOF'
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());

// 🔥 Phoenix: Real-time auth events
const authEvents = [];
const connectedDevices = new Map();

// 🔥 Phoenix: WebSocket for real-time auth monitoring
io.on('connection', (socket) => {
  console.log('🔥 Phoenix: Device connected for real-time auth');
  
  socket.on('device-auth-request', async (data) => {
    // Phoenix innovation: Device-based authentication
    const deviceAuth = {
      deviceId: data.deviceId,
      type: 'device-auth',
      timestamp: new Date(),
      status: 'authenticated'
    };
    
    connectedDevices.set(socket.id, deviceAuth);
    authEvents.push(deviceAuth);
    
    // Broadcast to all connected clients
    io.emit('auth-event', deviceAuth);
  });
  
  socket.on('disconnect', () => {
    connectedDevices.delete(socket.id);
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, deviceInfo } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: `phoenix_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      role: 'user',
      deviceInfo: deviceInfo || null, // 🔥 Phoenix: Device tracking
      team: 'phoenix',
      createdAt: new Date()
    };
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        team: 'phoenix',
        deviceId: deviceInfo?.id 
      },
      process.env.JWT_SECRET || 'phoenix-fire-secret',
      { expiresIn: '24h' }
    );
    
    // 🔥 Phoenix: Real-time auth event
    const authEvent = {
      type: 'user-registered',
      userId: user.id,
      email: user.email,
      deviceInfo,
      timestamp: new Date()
    };
    
    authEvents.push(authEvent);
    io.emit('auth-event', authEvent);
    
    res.status(201).json({
      message: '🔥 Phoenix team - Real-time IoT-ready authentication!',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      realTime: {
        eventBroadcast: true,
        connectedDevices: connectedDevices.size,
        eventId: authEvent.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Phoenix auth error' });
  }
});

// 🔥 Phoenix: Real-time dashboard endpoint
app.get('/api/auth/realtime-stats', (req, res) => {
  res.json({
    team: '🔥 Phoenix',
    connectedDevices: connectedDevices.size,
    totalAuthEvents: authEvents.length,
    recentEvents: authEvents.slice(-5),
    capabilities: ['real-time', 'iot-ready', 'device-tracking']
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🔥 Phoenix Auth Service - Real-time IoT ready on port ${PORT}`);
});

module.exports = app;
EOF

git add .
git commit -m "feat(auth): 🔥 Phoenix real-time IoT-ready auth with WebSockets"
git push origin competition/week1-auth-service
```

### 🦄 **Unicorn Team (Auth Service - Semana 1)**

#### **Setup para Competencia Unicorn**
```bash
# Unicorn approach: DevOps-first, container-native
git checkout E4-Unicorn-🦄
git checkout -b competition/week1-auth-service

mkdir auth-service-unicorn
cd auth-service-unicorn
npm init -y
npm install express jsonwebtoken bcryptjs prom-client
npm install -D jest supertest
```

#### **Tu Primera Tarea Unicorn - Container-Native Auth**
```bash
# Unicorn innovation: Production-ready with monitoring
cat > index.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const client = require('prom-client');

const app = express();
app.use(express.json());

// 🦄 Unicorn: Prometheus metrics
const register = new client.Registry();
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const authCounter = new client.Counter({
  name: 'auth_requests_total',
  help: 'Total number of auth requests',
  labelNames: ['operation', 'status']
});

register.registerMetric(httpDuration);
register.registerMetric(authCounter);

// 🦄 Unicorn: Middleware for metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
});

// 🦄 Unicorn: Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    team: '🦄 Unicorn',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 🦄 Unicorn: Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.post('/api/auth/register', async (req, res) => {
  const timer = httpDuration.startTimer({ method: 'POST', route: '/api/auth/register' });
  
  try {
    const { email, password, name } = req.body;
    
    // 🦄 Unicorn: Input validation
    if (!email || !password || !name) {
      authCounter.inc({ operation: 'register', status: 'validation_error' });
      timer({ status_code: 400 });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: `unicorn_${Date.now()}`,
      email,
      name,
      password: hashedPassword,
      role: 'user',
      team: 'unicorn',
      createdAt: new Date()
    };
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, team: 'unicorn' },
      process.env.JWT_SECRET || 'unicorn-magic-secret',
      { expiresIn: '24h' }
    );
    
    authCounter.inc({ operation: 'register', status: 'success' });
    timer({ status_code: 201 });
    
    res.status(201).json({
      message: '🦄 Unicorn team - Production-ready auth with monitoring!',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      devOps: {
        containerReady: true,
        monitored: true,
        healthChecks: true,
        metrics: 'prometheus'
      }
    });
  } catch (error) {
    authCounter.inc({ operation: 'register', status: 'error' });
    timer({ status_code: 500 });
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🦄 Unicorn Auth Service - Production ready on port ${PORT}`);
});

module.exports = app;
EOF

# 🦄 Unicorn: Advanced Dockerfile
cat > Dockerfile << 'EOF'
# Multi-stage build for optimal container size
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build 2>/dev/null || echo "No build step defined"

FROM node:18-alpine AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 authuser

# Copy dependencies and app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

USER authuser

EXPOSE 3001

CMD ["node", "index.js"]
EOF

# 🦄 Unicorn: Docker Compose for testing
cat > docker-compose.test.yml << 'EOF'
version: '3.8'
services:
  auth-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=test
      - JWT_SECRET=test-secret
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3
EOF

git add .
git commit -m "feat(auth): 🦄 Unicorn production-ready auth with monitoring & containers"
git push origin competition/week1-auth-service
```

---

## 📚 Learning Path

### 🎓 **Semana 1: Foundations**
- [ ] ✅ Configurar entorno de desarrollo
- [ ] 📖 Leer documentación del proyecto
- [ ] 🤝 Conocer a tu equipo
- [ ] 🔧 Completar primera tarea
- [ ] 📝 Hacer tu primer Pull Request

### 🎓 **Semana 2: Integration**
- [ ] 🔄 Entender el workflow del equipo
- [ ] 🧪 Aprender testing estrategies
- [ ] 🤝 Colaborar con otros equipos
- [ ] 📊 Entender métricas del proyecto
- [ ] 🎯 Tomar ownership de una feature

### 🎓 **Semana 3: Mastery**
- [ ] 🚀 Lead a small feature
- [ ] 🎓 Mentorear a nuevo team member
- [ ] 📖 Contribuir a documentación
- [ ] 🔧 Mejorar tooling/processes
- [ ] 🎉 Celebrate achievements!

---

## 🆘 Getting Help

### 🔍 **Self-Service Resources**
1. 📖 **Documentation**: Check `/docs/` folder
2. 🐛 **Common Issues**: See FAQ section below
3. 💬 **Past Discussions**: Search GitHub Issues/PRs
4. 🧪 **Examples**: Look at `/example-simple-warehouse/`

### 👥 **Team Support**
1. **Team Lead**: Ask in team branch PR/Issues
2. **Cross-Team**: Use `@team-name` in GitHub comments
3. **Urgent**: Create Issue with `priority:high` label
4. **General**: Ask in project Discussions

### 🚨 **Escalation Path**
```
You → Team Lead → Technical Lead → Project Maintainer
```

---

## ❓ FAQ for New Contributors

### **Q: ¿Qué equipo debería elegir?**
**A:** Elige basándote en tus intereses y skills:
- 🎨 **Frontend/UI** → Dragons
- ⚙️ **Backend/APIs** → Kraken  
- 🔌 **IoT/Hardware** → Phoenix
- 🛠️ **DevOps/Testing** → Unicorn

### **Q: ¿Puedo cambiar de equipo después?**
**A:** ¡Sí! Los equipos son flexibles. Habla con los team leads.

### **Q: No tengo experiencia en el stack tecnológico**
**A:** ¡Perfecto! Cada equipo tiene mentors y learning resources.

### **Q: ¿Cómo sé qué tarea tomar?**
**A:** Busca issues con labels `good-first-issue` o `help-wanted` en tu equipo.

### **Q: Mi PR fue rechazado, ¿qué hago?**
**A:** Normal! Lee los comments, haz los cambios, y re-submit. ¡Es parte del learning!

### **Q: ¿Cómo mantengo mi fork actualizado?**
**A:** 
```bash
git checkout develop
git pull origin develop
git checkout tu-branch
git rebase develop
```

### **Q: ¿Qué pasa si rompo algo?**
**A:** ¡No worries! Tenemos tests y CI/CD. Si algo se rompe, team Unicorn lo arregla.

### **Q: ¿Cuánto tiempo debo dedicar?**
**A:** Lo que puedas. Desde 2 horas/semana hasta full-time está bien.

---

## 🎉 Welcome Message

```
🎊 ¡FELICIDADES! 🎊

Has completado el onboarding básico del proyecto ComSocUPC Inventory.

🎯 NEXT STEPS:
1. Únete a tu equipo en su rama específica
2. Toma tu primera issue 
3. Haz tu primer Pull Request
4. ¡Celebra tu primera contribución!

🤝 REMEMBER:
- Haz preguntas sin miedo
- Ayuda a otros cuando puedas  
- Celebra pequeños wins
- Ten fun coding! 🚀

Welcome to the team! 🎉
```

---

**🎯 Con esta guía, cualquier nuevo contribuidor puede empezar a trabajar en menos de 10 minutos!** 🚀
