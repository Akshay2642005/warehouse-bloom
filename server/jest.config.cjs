module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/index.ts',
    '!src/server.ts'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    // Temporarily low; will raise after baseline suite in place
  global: { lines: 10, statements: 10, functions: 10, branches: 3 }
  },
  testTimeout: 30000,
  projects: [
    {
      displayName: 'server-unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }] }
    },
    {
      displayName: 'server-integration',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/tests/setup/jest.env.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/integration.setup.ts'],
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      transform: { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }] },
      maxWorkers: 1
    }
  ]
  ,moduleFileExtensions: ['ts','tsx','js','json']
  ,moduleNameMapper: {
    '^../utils/config$': '<rootDir>/src/utils/config.ts',
    '^\.\./utils/config$': '<rootDir>/src/utils/config.ts',
    '^.*config\.js$': '<rootDir>/src/utils/config.ts'
  }
};
