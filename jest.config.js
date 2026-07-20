module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|react-native-date-picker)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
