module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: ['react', 'react-hooks'],
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};