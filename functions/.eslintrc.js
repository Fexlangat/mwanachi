module.exports = {
  env: {
    node: true, // Enable Node.js environment (defines 'require', 'module', 'exports')
    es2021: true, // Enable modern JavaScript features
  },
  extends: [
    'eslint:recommended', // Use ESLint's recommended rules
  ],
  parserOptions: {
    ecmaVersion: 12, // Support ES2021 syntax
    sourceType: 'module', // Allow ES modules (though we're using CommonJS here)
  },
  rules: {
    'no-undef': 'off', // Temporarily disable to allow 'require' and 'exports'
    'no-unused-vars': 'off', // Temporarily disable to allow '_context'
  },
};