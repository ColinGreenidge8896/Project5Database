export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/backend/src/tests/unit/**/*.test.js'],
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: [
    '<rootDir>/backend/src/**/*.js',
    '!<rootDir>/backend/src/tests/**',
    '!<rootDir>/backend/src/node_modules/**'
  ],
  coveragePathIgnorePatterns: [
    '/routes/'
  ]
};
