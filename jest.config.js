module.exports = {
  preset: '@react-native/jest-preset',
  haste: { defaultPlatform: 'android', platforms: ['android', 'ios', 'native'] },
  testMatch: ['**/__tests__/**/*.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-ble-plx)/)',
  ],
};
