module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  setupFiles: ['./tests/globalSetup.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
