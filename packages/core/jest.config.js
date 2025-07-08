export default {
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: ['@babel/preset-env'],
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@typescript-eslint|eslint)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
}; 