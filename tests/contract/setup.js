const { Pact } = require('@pact-foundation/pact');
const path = require('path');

// Configuración global para Pact
global.provider = new Pact({
  consumer: 'api-gateway',
  provider: 'auth-service',
  port: 9001,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'info',
  spec: 2
});

// Setup para inicializar el mock server
beforeAll(async () => {
  await global.provider.setup();
});

// Cleanup después de todas las pruebas
afterAll(async () => {
  await global.provider.finalize();
});

// Limpiar interacciones entre pruebas
afterEach(async () => {
  await global.provider.verify();
});

// Variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.AUTH_SERVICE_URL = 'http://localhost:9001';
process.env.PRODUCT_SERVICE_URL = 'http://localhost:9002';
process.env.INVENTORY_SERVICE_URL = 'http://localhost:9003';
process.env.IOT_SERVICE_URL = 'http://localhost:9004';

// Mock de servicios externos si es necesario
jest.mock('redis', () => require('redis-mock'));
jest.mock('mqtt', () => ({
  connect: jest.fn(() => ({
    on: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
    end: jest.fn()
  }))
}));
