# 🎯 Guía de Equipos - Roles y Responsabilidades

Esta guía define las responsabilidades específicas de cada equipo en el proyecto y cómo colaborar efectivamente entre equipos.

## 📊 Overview de Equipos

| Equipo | Rama | Enfoque Principal | Stack Tecnológico | Lider |
|--------|------|------------------|-------------------|-------|
| 🐉 **Dragons** | `E1-Dragons-🐉` | Frontend & UI/UX | React, CSS, Figma | TBD |
| 🐙 **Kraken** | `E2-Kraken-🐙` | Backend & APIs | Node.js, Express, PostgreSQL | TBD |
| 🔥 **Phoenix** | `E3-Phoenix-🔥` | IoT & Hardware | MQTT, WebSockets, Simulators | TBD |
| 🦄 **Unicorn** | `E4-Unicorn-🦄` | DevOps & Testing | Docker, CI/CD, Jest | TBD |

---

## 🐉 E1-Dragons Team (Frontend & UI/UX)

### 🎯 **Responsabilidades Principales**
- ✅ **Desarrollo Frontend**: Interfaces de usuario con React
- ✅ **UX/UI Design**: Diseño de experiencia y interfaces
- ✅ **Responsive Design**: Adaptación móvil y desktop
- ✅ **Accesibilidad**: Cumplimiento de estándares WCAG
- ✅ **Performance Frontend**: Optimización de carga y rendering
- ✅ **Testing Frontend**: Unit tests y E2E testing

### 📁 **Archivos Principales**
```
1-frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   ├── hooks/              # React hooks personalizados
│   ├── context/            # Context providers
│   ├── styles/             # Estilos globales y temas
│   ├── utils/              # Utilidades frontend
│   └── api/                # Clients para APIs
├── public/                 # Assets estáticos
├── tests/                  # Tests frontend
└── docs/                   # Documentación UI/UX
```

### 🛠️ **Stack Tecnológico**
- **Framework**: React 18+
- **Styling**: CSS Modules / Styled Components
- **State Management**: Context API / Redux Toolkit
- **Testing**: Jest + React Testing Library + Cypress
- **Build**: Vite / Create React App
- **Design**: Figma / Adobe XD

### 📋 **Tareas Típicas**
#### **Sprint Planning**
- [ ] Review de designs/mockups
- [ ] Estimation de componentes
- [ ] Definición de user stories
- [ ] Planificación de responsive breakpoints

#### **Durante el Sprint**
- [ ] Desarrollo de componentes
- [ ] Integration con APIs del team Kraken
- [ ] Testing de usabilidad
- [ ] Cross-browser testing
- [ ] Performance optimization

#### **Sprint Review**
- [ ] Demo de funcionalidades
- [ ] User acceptance testing
- [ ] Documentation de componentes
- [ ] Handoff a QA team

### 🔄 **Workflow Dragons**
```bash
# 1. Sync con develop
git checkout develop
git pull origin develop

# 2. Actualizar rama de team
git checkout E1-Dragons-🐉
git merge develop
git push origin E1-Dragons-🐉

# 3. Crear feature branch
git checkout -b feature/DRAG-123-user-dashboard

# 4. Desarrollo
# - Crear componente
# - Añadir tests
# - Actualizar storybook
# - Testing manual

# 5. Commit y push
git add .
git commit -m "feat(dashboard): implement user stats widget with responsive design"
git push origin feature/DRAG-123-user-dashboard

# 6. Create PR
gh pr create --title "feat(dashboard): user stats widget" --body "..."
```

### 🧪 **Testing Strategy Dragons**
```bash
# Unit Tests
npm run test:unit

# Component Tests  
npm run test:components

# E2E Tests
npm run test:e2e

# Visual Regression Tests
npm run test:visual

# Performance Tests
npm run lighthouse
```

### 📊 **Métricas Dragons**
- **Performance**: Core Web Vitals, Lighthouse scores
- **Quality**: Component test coverage, E2E coverage
- **UX**: User feedback, usability metrics
- **Accessibility**: WCAG compliance score

---

## 🐙 E2-Kraken Team (Backend & APIs)

### 🎯 **Responsabilidades Principales**
- ✅ **APIs RESTful**: Desarrollo de endpoints
- ✅ **Microservicios**: Arquitectura distribuida
- ✅ **Base de Datos**: Diseño y optimización
- ✅ **Autenticación**: JWT, OAuth, seguridad
- ✅ **Performance Backend**: Optimización de queries
- ✅ **Testing Backend**: Unit, integration, contract tests

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
