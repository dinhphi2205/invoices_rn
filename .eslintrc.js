module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
      // React Native Specific
      'react-native/no-inline-styles': 'warn',
      // 'react-native/no-color-literals': 'warn',
      'react-native/no-unused-styles': 'error',
      
      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // React
      'react/prop-types': 'off', // Turn off if using TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed for modern React
      'react/jsx-no-leaked-render': ['error', { 'validStrategies': ['coerce', 'ternary'] }],
      
    },
};
