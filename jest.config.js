export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
  transform: {},
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text'],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/node_modules/**',
    '!backend/tests/**'
  ]
};