module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|zustand|axios)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/navigation/types.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/__/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    'src/types/',
    'src/navigation/types.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
