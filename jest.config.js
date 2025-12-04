export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
  transform: {},
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text'],
  collectCoverageFrom: [
    'backend/src/**/*.js',
    '!backend/src/node_modules/**',
    '!backend/src/tests/**'
  ]
};