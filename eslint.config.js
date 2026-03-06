const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  {
    files: ['*.js', 'scripts/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['script.js'],
    languageOptions: {
      globals: {
        flashcardPacks: 'readonly',
        MasteryStore: 'readonly',
      },
    },
  },
  {
    files: ['cards.js', 'masteryStore.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
