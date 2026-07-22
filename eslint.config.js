import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import noBareStat from './eslint-rules/no-bare-stat.js';

const localPlugin = {
  rules: { 'no-bare-stat': noBareStat },
};

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { local: localPlugin },
  },
  {
    // The data-first gate applies to the view layer, where bare stats are dangerous.
    files: ['src/ui/**/*.tsx'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: { 'local/no-bare-stat': 'error' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'scripts/**'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
);
