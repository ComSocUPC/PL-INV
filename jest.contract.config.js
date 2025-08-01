module.exports = {
  preset: '@pact-foundation/jest-pact',
  testMatch: ['**/tests/contract/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/contract/setup.js'],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'services/*/src/**/*.js',
    '!services/*/src/**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage/contract',
  testTimeout: 30000,
  verbose: true
};
