module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  verbose: true,
  testMatch: ['**/tests/**/*.test.js'],
};
