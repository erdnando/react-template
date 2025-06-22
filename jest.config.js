module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    '^axios$': '<rootDir>/src/__mocks__/axios.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};