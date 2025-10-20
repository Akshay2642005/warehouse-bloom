module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  transform: { '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: 'tsconfig.app.json' }] },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [ 'src/**/*.{ts,tsx}', '!src/main.tsx', '!src/vite-env.d.ts' ],
  coverageThreshold: { global: { lines: 95, functions: 95, statements: 95, branches: 90 } }
};
