# Guía de Desarrollo - Mejores Prácticas para Equipos

## 📋 Índice

1. [Estándares de Código](#estándares-de-código)
2. [Gestión de Contratos API](#gestión-de-contratos-api)
3. [Control de Versiones](#control-de-versiones)
4. [Flujo de Trabajo Git](#flujo-de-trabajo-git)
5. [Testing](#testing)
6. [Documentación](#documentación)
7. [Despliegue](#despliegue)
8. [Monitoreo](#monitoreo)

## 🎯 Estándares de Código

### Estructura de Directorios

Cada microservicio debe seguir esta estructura estándar:

```
service-name/
├── src/
│   ├── app.js                  # Punto de entrada
│   ├── routes/                 # Definición de rutas
│   ├── controllers/            # Lógica de negocio
│   ├── models/                 # Modelos de datos
│   ├── middleware/             # Middlewares personalizados
│   ├── services/               # Servicios de negocio
│   ├── utils/                  # Utilidades comunes
│   ├── config/                 # Configuraciones
│   └── validators/             # Validadores de entrada
├── tests/
│   ├── unit/                   # Tests unitarios
│   ├── integration/            # Tests de integración
│   └── fixtures/               # Datos de prueba
├── docs/                       # Documentación específica
├── migrations/                 # Migraciones de BD
├── seeds/                      # Datos iniciales
├── package.json
├── Dockerfile
├── .env.example
├── .gitignore
├── .eslintrc.js
└── README.md
```

### Convenciones de Naming

#### Archivos y Directorios
```
kebab-case:          api-gateway, user-service
camelCase:           userController.js, authMiddleware.js
PascalCase:          UserModel.js, ProductService.js
UPPER_SNAKE_CASE:    .env variables
```

#### Variables y Funciones
```javascript
// ✅ Correcto
const getUserById = async (userId) => { ... }
const API_BASE_URL = process.env.API_URL;
const userProfile = await UserService.getProfile(id);

// ❌ Incorrecto
const get_user_by_id = async (user_id) => { ... }
const apibaseurl = process.env.API_URL;
const UserProfile = await UserService.getProfile(id);
```

#### Constantes y Enums
```javascript
// ✅ Correcto
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
};
```

### Estructura de Controllers

```javascript
// controllers/productController.js
const Joi = require('joi');
const ProductService = require('../services/ProductService');
const logger = require('../utils/logger');

class ProductController {
  // Validación de esquemas
  static schemas = {
    create: Joi.object({
      sku: Joi.string().required(),
      name: Joi.string().min(2).max(100).required(),
      categoryId: Joi.string().uuid().required(),
      unitPrice: Joi.number().positive().required(),
      costPrice: Joi.number().positive().required(),
    }),
    
    update: Joi.object({
      name: Joi.string().min(2).max(100),
      unitPrice: Joi.number().positive(),
      costPrice: Joi.number().positive(),
    }).min(1)
  };

  static async getProducts(req, res, next) {
    try {
      const { page = 1, limit = 10, search, category } = req.query;
      
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        category
      };

      const result = await ProductService.getProducts(filters);
      
      res.json({
        data: result.products,
        pagination: result.pagination
      });
      
    } catch (error) {
      logger.error('Error getting products:', error);
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      // Validación
      const { error, value } = ProductController.schemas.create.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message,
            value: d.context.value
          }))
        });
      }

      const product = await ProductService.createProduct(value, req.user.userId);
      
      res.status(201).json({
        message: 'Producto creado exitosamente',
        product
      });
      
    } catch (error) {
      logger.error('Error creating product:', error);
      next(error);
    }
  }
}

module.exports = ProductController;
```

### Manejo de Errores

#### Error Middleware
```javascript
// middleware/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.userId,
    timestamp: new Date().toISOString()
  });

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
      details: err.details
    });
  }

  // Errores de autorización
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token inválido o expirado'
    });
  }

  // Errores de base de datos
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      error: 'Conflicto',
      message: 'El recurso ya existe'
    });
  }

  // Error por defecto
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error interno'
  });
};

module.exports = errorHandler;
```

#### Custom Errors
```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError
};
```

## 📝 Gestión de Contratos API

### Design-First Approach

1. **Definir el contrato OpenAPI primero**
2. **Generar código base desde el contrato**
3. **Implementar la lógica de negocio**
4. **Validar contra el contrato**

### Proceso de Cambio de API

#### 1. Propuesta de Cambio
```yaml
# api-changes/RFC-001-add-product-variants.yaml
rfc: "001"
title: "Añadir soporte para variantes de productos"
author: "juan.perez@company.com"
date: "2024-01-15"
status: "draft" # draft | review | approved | implemented

summary: |
  Añadir capacidad de gestionar variantes de productos (tallas, colores, etc.)
  
motivation: |
  Los usuarios necesitan gestionar productos con múltiples variantes
  
design:
  endpoints:
    - "GET /api/products/{id}/variants"
    - "POST /api/products/{id}/variants" 
    - "PUT /api/products/{id}/variants/{variantId}"
    - "DELETE /api/products/{id}/variants/{variantId}"
  
  breaking_changes: false
  backward_compatible: true
  
migration:
  database:
    - "CREATE TABLE product_variants (...)"
  
testing:
    - "Unit tests for variant controller"
    - "Integration tests for variant API"
    - "Load testing with variants"
```

#### 2. Versionado de APIs

```yaml
# Versionado por header (recomendado)
headers:
  Accept: "application/vnd.inventory.v1+json"
  API-Version: "1.0"

# Versionado por URL (alternativa)
paths:
  /v1/api/products
  /v2/api/products
```

#### 3. Contract Testing

```javascript
// tests/contract/product-api.contract.test.js
const { Pact } = require('@pact-foundation/pact');
const axios = require('axios');

describe('Product API Contract', () => {
  const provider = new Pact({
    consumer: 'frontend-app',
    provider: 'product-service',
    port: 1234,
  });

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  it('should return products list', async () => {
    await provider
      .given('products exist')
      .uponReceiving('a request for products')
      .withRequest({
        method: 'GET',
        path: '/api/products',
        headers: {
          'Authorization': 'Bearer token123'
        }
      })
      .willRespondWith({
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: {
          data: Pact.eachLike({
            id: Pact.somethingLike('123e4567-e89b-12d3-a456-426614174000'),
            sku: Pact.somethingLike('PROD-001'),
            name: Pact.somethingLike('Product Name')
          }),
          pagination: {
            page: 1,
            total: 10
          }
        }
      });

    const response = await axios.get('http://localhost:1234/api/products', {
      headers: { 'Authorization': 'Bearer token123' }
    });

    expect(response.status).toBe(200);
    expect(response.data.data).toBeDefined();
  });
});
```

### Validación de Contratos

#### Usando OpenAPI Generator

```bash
# Generar validadores desde OpenAPI
npm install -g @openapitools/openapi-generator-cli

# Generar cliente
openapi-generator-cli generate \
  -i api-specs/openapi-products.yaml \
  -g javascript \
  -o clients/javascript-client

# Generar servidor stub
openapi-generator-cli generate \
  -i api-specs/openapi-products.yaml \
  -g nodejs-express-server \
  -o generated/server-stub
```

#### Middleware de Validación

```javascript
// middleware/openApiValidator.js
const OpenApiValidator = require('express-openapi-validator');
const path = require('path');

const apiSpecPath = path.join(__dirname, '../api-specs/openapi.yaml');

const validatorMiddleware = OpenApiValidator.middleware({
  apiSpec: apiSpecPath,
  validateRequests: true,
  validateResponses: process.env.NODE_ENV === 'development',
  ignorePaths: /.*\/health/
});

module.exports = validatorMiddleware;
```

## 🔄 Control de Versiones

### Convenciones de Git

#### Branch Strategy (Git Flow)
```
main              # Producción estable
├── develop       # Desarrollo integrado
├── feature/*     # Nuevas funcionalidades
├── release/*     # Preparación de releases
├── hotfix/*      # Correcciones urgentes
└── bugfix/*      # Correcciones de bugs
```

#### Naming Conventions
```bash
# Features
feature/TICKET-123-add-product-variants
feature/add-nfc-integration
feature/improve-search-performance

# Bugfixes
bugfix/TICKET-456-fix-inventory-calculation
bugfix/fix-authentication-timeout

# Hotfixes
hotfix/PROD-789-fix-critical-security-issue

# Releases
release/v1.2.0
release/v1.2.1-beta
```

#### Commit Messages (Conventional Commits)

```bash
# Formato: <type>(<scope>): <description>

# Tipos válidos:
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Cambios de formato
refactor: # Refactoring de código
test:     # Añadir/modificar tests
chore:    # Tareas de mantenimiento

# Ejemplos:
feat(products): add support for product variants
fix(auth): resolve token expiration issue
docs(api): update OpenAPI specifications
refactor(inventory): optimize stock calculation
test(auth): add integration tests for login
chore(deps): update dependencies to latest versions

# Para breaking changes:
feat(api)!: change product ID format to UUID
# o
feat(api): change product ID format to UUID

BREAKING CHANGE: Product IDs are now UUIDs instead of integers
```

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)

Ejemplos:
v1.0.0 -> v1.0.1 (bug fix)
v1.0.1 -> v1.1.0 (new feature)
v1.1.0 -> v2.0.0 (breaking change)
```

### Configuración de Git Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Ejecutar linting
npm run lint

# Ejecutar tests unitarios
npm run test:unit

# Validar OpenAPI specs
npm run validate:api-specs
```

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validar formato de commit message
npx commitlint --edit $1
```

### Release Process

#### 1. Preparación de Release

```bash
# Crear branch de release
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Actualizar versiones
npm version minor --no-git-tag-version

# Actualizar CHANGELOG
npm run changelog

# Commit cambios
git add .
git commit -m "chore(release): prepare v1.2.0"
```

#### 2. Release Notes Template

```markdown
# Release v1.2.0

## 🚀 Nuevas Funcionalidades
- feat(products): Soporte para variantes de productos
- feat(iot): Integración con sensores de humedad
- feat(reports): Nuevo reporte de rotación de inventario

## 🐛 Correcciones
- fix(auth): Resolver problema de expiración de tokens
- fix(inventory): Corregir cálculo de stock disponible

## 📚 Documentación
- docs(api): Actualizar especificaciones OpenAPI
- docs(iot): Añadir guía de integración de sensores

## ⚠️ Breaking Changes
- Ninguno

## 🔄 Migraciones
- Ejecutar: `npm run migrate`
- Nuevo tabla: `product_variants`

## 📋 Notas de Upgrade
1. Actualizar variables de entorno (ver .env.example)
2. Reiniciar servicios IoT
3. Verificar configuración de sensores
```

#### 3. Automatización con GitHub Actions

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build images
        run: |
          docker-compose build
          docker-compose push
          
      - name: Deploy to staging
        run: |
          kubectl apply -f k8s/staging/
          kubectl rollout status deployment/api-gateway -n staging
          
      - name: Run smoke tests
        run: npm run test:smoke
        
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: RELEASE_NOTES.md
```

## 🧪 Testing

### Estrategia de Testing

```
Pirámide de Testing:
      /\
     /  \    E2E Tests (5%)
    /____\
   /      \   Integration Tests (20%)
  /________\
 /          \  Unit Tests (75%)
/____________\
```

#### Test Types y Responsabilidades

| Tipo | Responsable | Frecuencia | Herramientas |
|------|-------------|------------|--------------|
| Unit | Developer | Cada commit | Jest, Mocha |
| Integration | Developer | Cada PR | Supertest, TestContainers |
| Contract | QA/Developer | Cada release | Pact |
| E2E | QA | Cada release | Cypress, Playwright |
| Performance | DevOps | Semanal | K6, Artillery |

### Configuración de Testing

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/migrations/**',
    '!src/seeds/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

```javascript
// tests/setup.js
const { GenericContainer } = require('testcontainers');

// Setup global test database
beforeAll(async () => {
  const postgres = await new GenericContainer('postgres:15-alpine')
    .withEnvironment({
      POSTGRES_DB: 'test_db',
      POSTGRES_USER: 'test_user',
      POSTGRES_PASSWORD: 'test_pass'
    })
    .withExposedPorts(5432)
    .start();

  process.env.DATABASE_URL = `postgresql://test_user:test_pass@localhost:${postgres.getMappedPort(5432)}/test_db`;
});

afterAll(async () => {
  // Cleanup
});
```

## 📚 Documentación

### Estructura de Documentación

```
docs/
├── api/                    # Documentación de APIs
│   ├── openapi/           # Especificaciones OpenAPI
│   ├── postman/           # Collections de Postman
│   └── examples/          # Ejemplos de uso
├── architecture/          # Documentación de arquitectura
│   ├── diagrams/          # Diagramas de arquitectura
│   ├── decisions/         # ADRs (Architecture Decision Records)
│   └── patterns/          # Patrones utilizados
├── deployment/            # Guías de despliegue
├── development/           # Guías de desarrollo
├── user/                  # Documentación de usuario
└── troubleshooting/       # Guía de solución de problemas
```

### Architecture Decision Records (ADRs)

```markdown
# ADR-001: Adopción de Microservicios

## Estado
Aceptado

## Contexto
Necesitamos arquitectura escalable para el sistema de inventario que permita:
- Desarrollo independiente por equipos
- Escalado granular por componente
- Tecnologías específicas por dominio
- Fallos aislados

## Decisión
Adoptar arquitectura de microservicios con:
- API Gateway como punto de entrada
- Servicios por dominio de negocio
- Base de datos por servicio
- Comunicación via REST + eventos

## Consecuencias

### Positivas
- Escalabilidad independiente
- Desarrollo paralelo
- Tecnologías específicas
- Resistencia a fallos

### Negativas
- Complejidad de despliegue
- Latencia entre servicios
- Transacciones distribuidas
- Monitoreo complejo

## Alternativas Consideradas
- Monolito modular
- Arquitectura hexagonal
- Serverless

## Referencias
- [Microservices Patterns](https://microservices.io/)
- [Building Microservices](https://www.oreilly.com/library/view/building-microservices/9781491950340/)
```

### API Documentation Standards

```yaml
# Estándar para documentar APIs
openapi: 3.0.3
info:
  title: "{Service Name} API"
  description: |
    Descripción detallada del servicio incluyendo:
    - Propósito y responsabilidades
    - Casos de uso principales
    - Limitaciones conocidas
    - Ejemplos de integración
  version: "1.0.0"
  contact:
    name: "Team Name"
    email: "team@company.com"
    url: "https://wiki.company.com/team"
  license:
    name: "MIT"

# Siempre incluir:
# - Ejemplos para cada endpoint
# - Códigos de error específicos
# - Rate limiting información
# - Autenticación requerida
# - Versionado de API
```

Esta guía establece las bases sólidas para el desarrollo en equipo. ¿Te gustaría que continue con las secciones de despliegue y monitoreo, o hay algún aspecto específico que quieras que desarrolle más?
