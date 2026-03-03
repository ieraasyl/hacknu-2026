// @ts-check

import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig(
  // Ignore generated/build artifacts
  {
    ignores: ['dist', '.wrangler', 'src/routeTree.gen.ts', 'worker-configuration.d.ts', 'drizzle'],
  },

  // JS + TS recommended rules
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // React JSX transform (covers react/react-in-jsx-scope: off)
  {
    ...reactPlugin.configs.flat['jsx-runtime'],
    files: ['**/*.{ts,tsx}'],
  },

  // react-hooks v7 ships a native flat config — spread directly to avoid plugin type mismatch
  {
    ...reactHooks.configs.flat.recommended,
    files: ['**/*.{ts,tsx}'],
  },

  // react-refresh + shared React settings
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
    },
  },

  // Must be last — disables ESLint rules that conflict with Prettier
  prettierConfig,

  // TanStack Router route files export createFileRoute(), not just components
  // shadcn ui files intentionally co-export CVA variant functions alongside components
  {
    files: ['src/routes/**/*.{ts,tsx}', 'src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
