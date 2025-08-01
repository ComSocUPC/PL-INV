# 🎯 Guía de Equipos - Metodología Competitiva

Esta guía define la **metodología competitiva** donde cada equipo de 2 personas implementa el mismo microservicio semanalmente, y se elige la mejor implementación.

## 🏆 Metodología de Trabajo Competitiva

### 📋 **Estructura de Competencia**
- **👥 Tamaño de Equipo**: 2 personas por equipo
- **⏱️ Duración**: 1 semana por microservicio
- **🎯 Objetivo**: Todos los equipos implementan el MISMO microservicio
- **🏆 Selección**: Se elige la MEJOR implementación de las 4
- **🔄 Rotación**: Nueva competencia cada semana con diferente microservicio

### 📊 Overview de Equipos Competitivos

| Equipo | Rama | Integrantes | Stack Base | Status |
|--------|------|-------------|------------|--------|
| 🐉 **Dragons** | `E1-Dragons-🐉` | 2 personas | Node.js, React | Listo |
| 🐙 **Kraken** | `E2-Kraken-🐙` | 2 personas | Node.js, Express | Listo |
| 🔥 **Phoenix** | `E3-Phoenix-🔥` | 2 personas | Node.js, MQTT | Listo |
| 🦄 **Unicorn** | `E4-Unicorn-🦄` | 2 personas | Node.js, Docker | Listo |

### 🎯 **Cronograma de Competencias**

| Semana | Microservicio | Descripción | Ganador | Estado |
|--------|---------------|-------------|---------|--------|
| **1** | 🔐 **Auth Service** | Sistema de autenticación JWT | TBD | 🏃‍♂️ En Progreso |
| **2** | 📦 **Product Service** | CRUD de productos con validaciones | TBD | ⏳ Pendiente |
| **3** | 📊 **Inventory Service** | Control de stock y movimientos | TBD | ⏳ Pendiente |
| **4** | 🔌 **IoT Gateway** | Comunicación con dispositivos IoT | TBD | ⏳ Pendiente |

---

## 🏁 Metodología de Competencia Semanal

### � **Proceso de Competencia**

#### **Lunes - Kick-off**
1. **📢 Anuncio del Microservicio**: Se revela qué microservicio implementar
2. **📋 Especificaciones**: Entrega de requirements y criterios de evaluación
3. **🎯 Planning**: Cada equipo planifica su approach en 2 horas máximo
4. **🚀 Start**: Desarrollo comienza oficialmente

#### **Lunes a Viernes - Desarrollo**
- **👥 Trabajo en Pareja**: Pair programming obligatorio
- **📈 Daily Updates**: Commit diario mínimo con progreso
- **🔄 Code Reviews**: Review interno entre los 2 miembros del equipo
- **📊 Tracking**: Updates en dashboard del equipo

#### **Viernes - Demo Day**
- **⏰ 16:00-17:00**: Cada equipo presenta su implementación (10 min + 5 min Q&A)
- **🎯 Demo Script**: 
  - Arquitectura y decisiones técnicas (3 min)
  - Demo funcional en vivo (5 min)
  - Testing y quality metrics (2 min)
- **📊 Evaluación**: Jurado evalúa según criterios establecidos

#### **Lunes Siguiente - Results**
- **🏆 Ganador Anunciado**: Presentación de resultados
- **🎊 Celebración**: Reconocimiento al equipo ganador
- **📚 Learning**: Qué aprendimos de todas las implementaciones
- **🔄 Merge**: La implementación ganadora se integra al proyecto principal

### 🎯 **Criterios de Evaluación**

| Criterio | Peso | Descripción |
|----------|------|-------------|
| **🏗️ Arquitectura** | 25% | Diseño, patrones, escalabilidad |
| **💻 Código** | 25% | Calidad, clean code, documentación |
| **🧪 Testing** | 20% | Coverage, tipos de tests, CI/CD |
| **🚀 Performance** | 15% | Velocidad, optimización, métricas |
| **🎨 Innovation** | 10% | Características únicas, creatividad |
| **📖 Documentation** | 5% | README, API docs, comentarios |

### 🏆 **Sistema de Puntuación**

#### **Por Competencia**
- 🥇 **1er Lugar**: 100 puntos + implementación en proyecto
- 🥈 **2do Lugar**: 70 puntos + reconocimiento  
- 🥉 **3er Lugar**: 50 puntos + feedback detallado
- 🏃‍♂️ **4to Lugar**: 30 puntos + mentoring para próxima semana

#### **Ranking General** (Acumulativo)
```
🏆 Leaderboard
┌─────────────────────────────────────┐
│ 1. 🐉 Dragons    - 0 pts (0 wins)  │
│ 2. 🐙 Kraken     - 0 pts (0 wins)  │  
│ 3. 🔥 Phoenix    - 0 pts (0 wins)  │
│ 4. 🦄 Unicorn    - 0 pts (0 wins)  │
└─────────────────────────────────────┘
```

---

## 🐉 E1-Dragons Team (Competencia Auth Service - Semana 1)

### 🎯 **Challenge: Implementar Auth Service**
**Deadline**: Viernes 16:00 - Demo Day

#### **Requirements Específicos**
- ✅ **JWT Authentication**: Login/logout con tokens
- ✅ **User Registration**: Registro con validaciones
- ✅ **Password Security**: Hash con bcrypt + salt
- ✅ **Role-based Access**: Admin/User roles
- ✅ **Rate Limiting**: Protección contra ataques
- ✅ **API Documentation**: OpenAPI 3.0 completo
- ✅ **Testing Suite**: Unit + Integration tests
- ✅ **Docker Ready**: Dockerfile optimizado

#### **Dragons Strategy Session** 🐉
```bash
# Sprint Planning Dragons
git checkout E1-Dragons-🐉
git pull origin E1-Dragons-🐉

# Crear rama de competencia
git checkout -b competition/week1-auth-service

# Strategy brainstorm (2 hours max)
# 1. Architecture decisions
# 2. Tech stack choices  
# 3. Innovation opportunities
# 4. Risk mitigation
```

#### **Desarrollo Dragons** (Lunes-Viernes)
```bash
# Daily workflow
git checkout competition/week1-auth-service

# Pair programming setup
# Person A: Driver (writes code)
# Person B: Navigator (reviews, suggests)

# Daily commit
git add .
git commit -m "feat(auth): day X progress - implement JWT middleware"
git push origin competition/week1-auth-service

# Switch roles daily
```

#### **Dragons Innovation Ideas** 💡
- 🔐 **2FA Integration**: SMS/Email verification
- 🎨 **Custom JWT Claims**: User preferences in token
- 📱 **Social Login**: OAuth with Google/GitHub
- 🛡️ **Advanced Security**: Refresh token rotation
- 📊 **Analytics**: Login patterns tracking
- 🎯 **API Versioning**: v1/v2 support

---

## � E2-Kraken Team (Competencia Auth Service - Semana 1)

### 🎯 **Challenge: Implementar Auth Service**
**Deadline**: Viernes 16:00 - Demo Day

#### **Kraken Strategy Session** 🐙
```bash
# Sprint Planning Kraken
git checkout E2-Kraken-🐙
git pull origin E2-Kraken-🐙

# Crear rama de competencia
git checkout -b competition/week1-auth-service

# Kraken approach brainstorm
# 1. Database design first
# 2. API contract definition
# 3. Performance optimizations
# 4. Security hardening
```

#### **Kraken Innovation Ideas** �
- 🗄️ **Advanced DB**: PostgreSQL with connection pooling
- 🔄 **Microservice Pattern**: Event-driven architecture
- 🚀 **Caching Layer**: Redis for session management
- 📊 **Monitoring**: Prometheus metrics integration
- 🛡️ **Security Headers**: Helmet.js + CORS optimization
- 🔍 **Logging**: Structured logging with Winston

---

## 🔥 E3-Phoenix Team (Competencia Auth Service - Semana 1)

### 🎯 **Challenge: Implementar Auth Service**
**Deadline**: Viernes 16:00 - Demo Day

#### **Phoenix Strategy Session** 🔥
```bash
# Sprint Planning Phoenix
git checkout E3-Phoenix-🔥
git pull origin E3-Phoenix-🔥

# Crear rama de competencia
git checkout -b competition/week1-auth-service

# Phoenix innovative approach
# 1. IoT-ready authentication
# 2. Device-based auth flows
# 3. Real-time features
# 4. Message-based architecture
```

#### **Phoenix Innovation Ideas** 💡
- 🔌 **IoT Integration**: Device authentication via MQTT
- 📡 **Real-time Auth**: WebSocket-based live sessions
- 🎯 **Device Fingerprinting**: Hardware-based security
- 🌐 **Edge Computing**: Distributed auth nodes
- 📱 **Biometric Support**: Preparation for fingerprint/face ID
- 🔄 **Event Sourcing**: Auth events as streams

---

## 🦄 E4-Unicorn Team (Competencia Auth Service - Semana 1)

### 🎯 **Challenge: Implementar Auth Service**
**Deadline**: Viernes 16:00 - Demo Day

#### **Unicorn Strategy Session** 🦄
```bash
# Sprint Planning Unicorn
git checkout E4-Unicorn-🦄
git pull origin E4-Unicorn-🦄

# Crear rama de competencia
git checkout -b competition/week1-auth-service

# Unicorn DevOps-first approach
# 1. Container-native design
# 2. CI/CD pipeline integrated
# 3. Monitoring and observability
# 4. Infrastructure as Code
```

#### **Unicorn Innovation Ideas** 💡
- 🐳 **Container-First**: Multi-stage optimized Docker
- 🤖 **CI/CD Native**: Integrated testing pipeline
- 📊 **Observability**: Health checks + metrics + tracing
- 🛡️ **Security Scanning**: Automated vulnerability detection
- 🚀 **Auto-scaling**: Kubernetes-ready configuration
- 📈 **Performance Testing**: Automated load testing

---

## 🔄 Workflow de Competencia Semanal

### 📋 **Template de Rama de Competencia**
```bash
# Naming convention para competencias
competition/week{N}-{microservice-name}

# Ejemplos:
competition/week1-auth-service
competition/week2-product-service
competition/week3-inventory-service
competition/week4-iot-gateway
```

### 🧪 **Testing Strategy para Competencia**
```bash
# Cada equipo debe tener:
npm run test:unit          # Unit tests (>80% coverage)
npm run test:integration   # Integration tests
npm run test:contract      # API contract tests
npm run test:performance   # Load testing
npm run test:security      # Security scanning
npm run test:e2e          # End-to-end tests
```

### 📊 **Demo Day Presentation Template**

#### **Slide 1: Team & Architecture (3 min)**
```markdown
## 🐉 Team Dragons - Auth Service
### Architecture Overview
- **Pattern**: [Your architectural pattern]
- **Database**: [Your choice + why]
- **Key Decisions**: [3 bullet points]
- **Innovation**: [Your unique approach]
```

#### **Slide 2: Live Demo (5 min)**
```bash
# Demo script example
curl -X POST http://localhost:3001/api/auth/register
curl -X POST http://localhost:3001/api/auth/login
curl -H "Authorization: Bearer {token}" http://localhost:3001/api/auth/profile
```

#### **Slide 3: Quality Metrics (2 min)**
```markdown
## Quality Dashboard
- 🧪 **Test Coverage**: X%
- ⚡ **Response Time**: Xms
- 🛡️ **Security Score**: X/10
- 📦 **Bundle Size**: XMB
- 🐳 **Container Size**: XMB
```

### 🏆 **Post-Competition Process**

#### **Ganador Selection (Lunes)**
```bash
# El equipo ganador debe:
git checkout develop
git merge competition/week1-auth-service-WINNER
git push origin develop

# Documentar decisiones
echo "# Week 1 Winner: Team Dragons Auth Service" >> COMPETITION_LOG.md
echo "Winning features: JWT + 2FA + Performance" >> COMPETITION_LOG.md
```

#### **Learning Session (Lunes)**
- **🎓 Knowledge Sharing**: Cada equipo comparte 1 técnica aprendida
- **🔄 Retrospective**: Qué funcionó, qué mejorar
- **📈 Metrics Review**: Análisis de resultados
- **🎯 Next Week Prep**: Anuncio del siguiente challenge

---

## 🎊 Gamification & Motivation

### 🏅 **Logros Desbloqueables**
- 🥇 **First Blood**: Primera victoria en competencia
- 🔥 **Hat Trick**: 3 victorias consecutivas
- 💎 **Perfect Score**: 100% en todos los criterios
- 🚀 **Speed Demon**: Entrega antes del jueves
- 🛡️ **Fort Knox**: Mejor security implementation
- 🎨 **Innovator**: Característica más creativa

### 🎯 **Weekly Challenges Extra**
- 💡 **Innovation Bonus**: +20 pts por feature única
- 🚀 **Performance Bonus**: +15 pts por mejor benchmark
- 📖 **Documentation Bonus**: +10 pts por mejor docs
- 🧪 **Testing Bonus**: +10 pts por mejor coverage

### 🏆 **Season Rewards**
- **Champion Team**: Reconocimiento público + certificado
- **MVP Individual**: Mención especial + badge LinkedIn  
- **Innovation Award**: Para la característica más creativa
- **Community Choice**: Votación popular entre implementaciones

### 📁 **Archivos Principales**
```
2-backend/
├── api-gateway/            # Punto de entrada principal
│   ├── src/
│   │   ├── routes/        # Rutas del gateway
│   │   ├── middleware/    # Auth, rate limiting, etc.
│   │   └── utils/         # Utilidades gateway
│   └── tests/             # Tests del gateway
├── auth-service/           # Servicio autenticación
├── product-service/        # Servicio productos
├── inventory-service/      # Servicio inventario
├── iot-gateway/           # Gateway IoT
└── shared/                # Código compartido
    ├── middleware/        # Middleware común
    ├── utils/            # Utilidades compartidas
    └── types/            # Tipos TypeScript
```

### 🛠️ **Stack Tecnológico**
- **Runtime**: Node.js 18+
- **Framework**: Express.js / Fastify
- **Database**: PostgreSQL + Redis
- **ORM**: Prisma / TypeORM
- **Testing**: Jest + Supertest + Pact
- **Documentation**: OpenAPI 3.0 / Swagger
- **Message Queue**: MQTT / RabbitMQ

### 📋 **Tareas Típicas**
#### **Sprint Planning**
- [ ] Review de API requirements
- [ ] Database schema design
- [ ] API contract definition (OpenAPI)
- [ ] Performance requirements analysis

#### **Durante el Sprint**
- [ ] Implementación de endpoints
- [ ] Database migrations
- [ ] Middleware development
- [ ] API documentation
- [ ] Integration testing
- [ ] Contract testing con team Dragons

#### **Sprint Review**
- [ ] API demo y testing
- [ ] Performance benchmarks
- [ ] Security audit
- [ ] Documentation review

### 🔄 **Workflow Kraken**
```bash
# 1. Sync y setup
git checkout E2-Kraken-🐙
git pull origin E2-Kraken-🐙

# 2. Crear feature branch
git checkout -b feature/KRAK-456-product-search-api

# 3. Desarrollo
# - Implementar endpoint
# - Añadir validation
# - Escribir tests
# - Actualizar OpenAPI spec

# 4. Testing
npm run test:unit
npm run test:integration
npm run test:contracts

# 5. Commit
git commit -m "feat(api): implement product search with filtering and pagination"

# 6. PR con documentación API
gh pr create --title "feat(api): product search endpoints" --body "..."
```

### 🧪 **Testing Strategy Kraken**
```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# Contract Tests (con Dragons team)
npm run test:contracts

# Load Testing
npm run test:load

# Security Testing
npm run test:security
```

### 📊 **Métricas Kraken**
- **Performance**: Response time, throughput, database query time
- **Quality**: Test coverage, API uptime
- **Security**: Vulnerability scans, auth metrics
- **Documentation**: API documentation completeness

---

## 🔥 E3-Phoenix Team (IoT & Hardware)

### 🎯 **Responsabilidades Principales**
- ✅ **Simuladores IoT**: Dispositivos virtuales NFC, sensores
- ✅ **Protocolos IoT**: MQTT, WebSockets, HTTP
- ✅ **Real-time Events**: Streaming de datos IoT
- ✅ **Device Management**: Registro y monitoreo
- ✅ **Hardware Integration**: Preparación para hardware real
- ✅ **IoT Security**: Autenticación de dispositivos

### 📁 **Archivos Principales**
```
2-backend/iot-gateway/
├── src/
│   ├── simulators/        # Simuladores de dispositivos
│   │   ├── nfc/          # Simulador NFC
│   │   ├── sensors/      # Sensores (temp, humedad, etc.)
│   │   └── actuators/    # Actuadores (luces, motores)
│   ├── protocols/        # Protocolos de comunicación
│   │   ├── mqtt/         # Cliente/servidor MQTT
│   │   ├── websocket/    # WebSocket server
│   │   └── http/         # HTTP endpoints
│   ├── devices/          # Device management
│   └── events/           # Event handling
└── example-simple-warehouse/iot-service/
```

### 🛠️ **Stack Tecnológico**
- **IoT Protocols**: MQTT, WebSockets, CoAP
- **Message Broker**: Mosquitto / HiveMQ
- **Real-time**: Socket.io / native WebSockets
- **Device Simulation**: Node.js scripts
- **Data Formats**: JSON, MessagePack, Protocol Buffers
- **Testing**: MQTT testing tools, WebSocket testing

### 📋 **Tareas Típicas**
#### **Sprint Planning**
- [ ] Device requirements analysis
- [ ] Protocol selection and design
- [ ] Simulation scenarios definition
- [ ] Real-time event modeling

#### **Durante el Sprint**
- [ ] Simulator development
- [ ] Protocol implementation
- [ ] WebSocket event handlers
- [ ] Device registration system
- [ ] Real-time dashboard data
- [ ] Integration con team Kraken

#### **Sprint Review**
- [ ] Demo de simuladores
- [ ] Real-time event streaming
- [ ] Performance de comunicación
- [ ] Preparación para hardware real

### 🔄 **Workflow Phoenix**
```bash
# 1. Setup
git checkout E3-Phoenix-🔥
git pull origin E3-Phoenix-🔥

# 2. Feature branch
git checkout -b feature/PHOE-789-temperature-sensor-v2

# 3. Desarrollo
# - Crear simulador
# - Implementar MQTT topics
# - WebSocket events
# - Testing con clientes

# 4. Testing
npm run test:simulators
npm run test:mqtt
npm run test:websockets

# 5. Commit
git commit -m "feat(iot): enhance temperature sensor with historical data"

# 6. PR
gh pr create --title "feat(iot): temperature sensor v2" --body "..."
```

### 🧪 **Testing Strategy Phoenix**
```bash
# Simulator Tests
npm run test:simulators

# Protocol Tests
npm run test:mqtt
npm run test:websocket

# Integration Tests (con Kraken)
npm run test:integration

# Performance Tests
npm run test:performance

# End-to-End IoT Tests
npm run test:e2e:iot
```

### 📊 **Métricas Phoenix**
- **Performance**: Message latency, throughput, connection stability
- **Quality**: Simulator accuracy, protocol compliance
- **Real-time**: Event delivery time, WebSocket connections
- **Device**: Device registration success rate

---

## 🦄 E4-Unicorn Team (DevOps & Testing)

### 🎯 **Responsabilidades Principales**
- ✅ **CI/CD Pipelines**: Automatización deployment
- ✅ **Containerización**: Docker, orchestration
- ✅ **Testing Strategy**: Framework de testing completo
- ✅ **Monitoring**: Logs, métricas, alertas
- ✅ **Infrastructure**: IaC, cloud resources
- ✅ **Security**: Security scans, compliance

### 📁 **Archivos Principales**
```
.github/
├── workflows/             # GitHub Actions
│   ├── ci-cd.yml         # Pipeline principal
│   ├── security.yml      # Security scans
│   └── deploy.yml        # Deployment
├── ISSUE_TEMPLATE/       # Issue templates
└── pull_request_template.md

docker-compose.yml         # Orquestación local
docker-compose.prod.yml    # Producción

tests/
├── unit/                 # Tests unitarios
├── integration/          # Tests integración
├── e2e/                  # End-to-end tests
├── contract/             # Contract tests
├── performance/          # Load testing
└── security/             # Security tests
```

### 🛠️ **Stack Tecnológico**
- **Containers**: Docker, Docker Compose
- **CI/CD**: GitHub Actions, GitLab CI
- **Testing**: Jest, Cypress, k6, Pact
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Infrastructure**: Terraform, Ansible
- **Security**: OWASP ZAP, Snyk, SonarQube

### 📋 **Tareas Típicas**
#### **Sprint Planning**
- [ ] Pipeline requirements analysis
- [ ] Testing strategy update
- [ ] Infrastructure needs assessment
- [ ] Security requirements review

#### **Durante el Sprint**
- [ ] Pipeline development/improvement
- [ ] Test automation
- [ ] Infrastructure provisioning
- [ ] Monitoring setup
- [ ] Security scans
- [ ] Documentation DevOps

#### **Sprint Review**
- [ ] Pipeline demo
- [ ] Test results review
- [ ] Performance metrics
- [ ] Security report

### 🔄 **Workflow Unicorn**
```bash
# 1. Setup
git checkout E4-Unicorn-🦄
git pull origin E4-Unicorn-🦄

# 2. Feature branch
git checkout -b feature/UNI-101-enhanced-ci-pipeline

# 3. Desarrollo
# - Actualizar workflow
# - Añadir tests
# - Configurar monitoring
# - Security checks

# 4. Testing
npm run test:ci
npm run test:security
npm run test:performance

# 5. Commit
git commit -m "feat(ci): add automated security scanning and performance tests"

# 6. PR
gh pr create --title "feat(ci): enhanced pipeline with security" --body "..."
```

### 🧪 **Testing Strategy Unicorn**
```bash
# All Tests
npm run test:all

# Specific Test Types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:contract
npm run test:performance
npm run test:security

# Pipeline Tests
npm run test:ci
npm run test:deploy
```

### 📊 **Métricas Unicorn**
- **CI/CD**: Build time, deployment frequency, failure rate
- **Quality**: Test coverage, code quality metrics
- **Performance**: Application performance, infrastructure metrics
- **Security**: Vulnerability count, compliance score

---

## 🤝 Colaboración Entre Equipos

### 🔄 **Cross-Team Dependencies**

#### **Dragons ↔ Kraken**
- **API Contracts**: Dragons consume Kraken APIs
- **Data Models**: Shared data structures
- **Authentication**: Token handling
- **Error Handling**: Consistent error responses

```bash
# Contract Testing
npm run test:contracts:dragons-kraken
```

#### **Kraken ↔ Phoenix**
- **IoT Events**: Backend processing of IoT data
- **Real-time APIs**: WebSocket integration
- **Device Management**: Device registration APIs

```bash
# Integration Testing
npm run test:integration:kraken-phoenix
```

#### **All Teams ↔ Unicorn**
- **CI/CD Support**: Pipeline maintenance
- **Testing Support**: Test infrastructure
- **Deployment**: Release coordination
- **Monitoring**: Metrics and alerts

### 📅 **Coordination Events**

#### **Daily Standup (Team-specific)**
- ⏰ **Tiempo**: 9:00 AM cada equipo
- 🎯 **Formato**: What, blockers, needs help

#### **Cross-Team Sync (Bi-weekly)**
- ⏰ **Tiempo**: Miércoles 2:00 PM
- 👥 **Participantes**: 1 representante por equipo
- 🎯 **Agenda**: Dependencies, blockers, demos

#### **Sprint Review (All Teams)**
- ⏰ **Tiempo**: Viernes 4:00 PM
- 👥 **Participantes**: Todo el equipo
- 🎯 **Agenda**: Demos, retrospective, planning

### 🎯 **Escalation Matrix**

| Issue Type | First Contact | Escalation | Timeline |
|------------|---------------|------------|----------|
| 🐛 Bug Blocking | Team lead affected | Technical lead | 4 hours |
| 🔒 Security Issue | Unicorn team | All teams | 2 hours |
| 🚀 Deployment Issue | Unicorn team | Technical lead | 1 hour |
| 📊 Performance Issue | Responsible team | Unicorn team | 8 hours |

---

## 📚 Resources por Equipo

### 🐉 **Dragons Resources**
- [React Documentation](https://react.dev/)
- [Web.dev Performance](https://web.dev/performance/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Frontend Handbook](https://frontendmasters.com/books/front-end-handbook/)

### 🐙 **Kraken Resources**
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OpenAPI Specification](https://swagger.io/specification/)
- [REST API Guidelines](https://restfulapi.net/)
- [Database Design Patterns](https://www.patterns.dev/)

### 🔥 **Phoenix Resources**
- [MQTT Documentation](https://mqtt.org/)
- [IoT Protocols Guide](https://www.postscapes.com/internet-of-things-protocols/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [IoT Security Guide](https://www.iotsecurityfoundation.org/)

### 🦄 **Unicorn Resources**
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testing Strategies](https://martinfowler.com/articles/practical-test-pyramid.html)
- [DevOps Handbook](https://itrevolution.com/book/the-devops-handbook/)

---

**🎯 ¡Con esta guía cada equipo tiene claridad sobre sus responsabilidades y cómo colaborar efectivamente!** 🚀
