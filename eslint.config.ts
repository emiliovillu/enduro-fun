// eslint.config.ts (raíz — el ÚNICO del monorepo)
// Adaptado de backend/references/tooling.md §2: proyecto sin packages/db ni
// apps/worker (PRD §6.2/§6.3) — sin plugin drizzle ni bloque de esa zona.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import * as importX from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import unusedImports from 'eslint-plugin-unused-imports';
import vitest from '@vitest/eslint-plugin';
import playwright from 'eslint-plugin-playwright';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';

// ── TD.6: lint de adherencia al design system (apps/web) ────────────────────
// Adaptado de docs/design-system/_adherence.oxlintrc.json (espejo de Claude
// Design) al flat config de ESLint de este repo — ver frontend/design-system.md
// §3.1. Los patrones se construyen como RegExp reales (no strings escapados a
// mano) y se insertan en el selector esquery vía `.source` para evitar el
// doble-escapado de barras invertidas.

// Familias de la paleta POR DEFECTO de Tailwind que el DS de este proyecto NO
// define como propias (globals.css solo define red/orange/amber/charcoal/sand/
// dust vía @theme inline) — @theme inline no resetea la paleta default, así que
// estas clases siguen disponibles y hay que prohibirlas explícitamente.
const nonDsTailwindColorFamilies = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
].join('|');
const rawTailwindColorPattern = new RegExp(
  `\\b(?:${nonDsTailwindColorFamilies})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`,
).source;

// Corchetes de Tailwind ([...]) con un valor CRUDO (hex/px/número/string)
// dentro de className. Excepción sancionada (design-system.md §3.1): si el
// contenido del corchete es (opcionalmente "--custom-prop:" seguido de)
// "var(--...)" — token inyectado vía var — NO se prohíbe. El lookahead exige
// que esa forma ocupe el corchete ENTERO (hasta el "]" de cierre), no solo el
// inicio — de lo contrario un valor crudo concatenado tras el var() legítimo
// (p. ej. `[var(--x)_#fff]`) se colaba sin marcar (hallazgo real de TD.6).
const rawArbitraryValuePattern =
  /\[(?!(?:[\w-]+:)?var\(--[\w-]+\)\])[^\]]*(?:#[0-9a-fA-F]{3,8}\b|\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|ch|deg|ms|s)?|'[^']*'|"[^"]*")[^\]]*\]/
    .source;

const classNameRawColorSelector = [
  `JSXAttribute[name.name='className'] Literal[value=/${rawTailwindColorPattern}/]`,
  `JSXAttribute[name.name='className'] TemplateElement[value.raw=/${rawTailwindColorPattern}/]`,
].join(', ');

const classNameRawArbitrarySelector = [
  `JSXAttribute[name.name='className'] Literal[value=/${rawArbitraryValuePattern}/]`,
  `JSXAttribute[name.name='className'] TemplateElement[value.raw=/${rawArbitraryValuePattern}/]`,
].join(', ');

export default defineConfig(
  // ── 1. Ignores globales: lo generado no se lintea jamás ──────────────────
  globalIgnores([
    '**/dist/**',
    '**/.next/**',
    '**/out/**',
    '**/coverage/**',
    '**/playwright-report/**',
    '**/test-results/**',
    // Espejo de solo lectura de Claude Design (regenerado por DesignSync): no
    // pertenece a ningún tsconfig del monorepo y no se edita ni se lintea.
    'docs/design-system/**',
  ]),

  // ── 2. Base typed para TODO el código TS ─────────────────────────────────
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true, // resuelve el tsconfig de CADA paquete solo; sin listas de project
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Innegociables — sin relajación de bloque, ni siquiera en tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },

  // ── 3. import-x: higiene y fronteras de imports ──────────────────────────
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['tsconfig.json', 'apps/*/tsconfig.json', 'packages/*/tsconfig.json'],
        }),
      ],
    },
    rules: {
      'import-x/no-cycle': 'error',
    },
  },

  // ── 4. unused-imports: autofix de imports muertos ────────────────────────
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // la sustituyen las dos siguientes
      'unused-imports/no-unused-imports': 'error', // autofixable en pre-commit (§7)
      'unused-imports/no-unused-vars': [
        'warn',
        { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // ── 5. apps/web: Next + React Hooks (React Compiler) ─────────────────────
  ...nextCoreWebVitals.map((cfg) => ({
    ...cfg,
    files: ['apps/web/**/*.{ts,tsx}'],
    settings: { ...cfg.settings, next: { rootDir: 'apps/web/' } },
  })),
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: { ...reactHooks.configs['recommended-latest'].rules },
  },

  // ── 5b. TD.6: lint de adherencia al design system (apps/web) ─────────────
  // Traduce las 3 prohibiciones de docs/design-system/_adherence.oxlintrc.json
  // (frontend/design-system.md §3.1): paleta cruda de Tailwind fuera de
  // globals.css, valores arbitrarios crudos en className (salvo el escape
  // hatch token-vía-var), e imports de librerías de iconos/Radix ajenas al
  // sistema propio (components/ui/icon.tsx, TD.3).
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: classNameRawColorSelector,
          message:
            'Paleta cruda de Tailwind — usa una clase semántica de token del DS (bg-accent-primary, text-text-secondary…), no una familia de color por defecto de Tailwind. Ver frontend/design-system.md §3.1.',
        },
        {
          selector: classNameRawArbitrarySelector,
          message:
            'Valor arbitrario crudo en className ([...] con hex/px/número/string) — usa una clase semántica del DS. Excepción sancionada: inyectar un token vía var(), p. ej. max-w-[var(--container-max)]. Ver frontend/design-system.md §3.1.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@radix-ui/*'],
              message:
                'Radix es opt-in que este proyecto NO usa (shadcn/ui sobre Base UI). No importar @radix-ui/* directamente.',
            },
            {
              group: ['lucide-react'],
              message:
                'Los iconos vienen SIEMPRE del registro propio components/ui/icon.tsx (TD.3). No se importan librerías de iconos externas.',
            },
            {
              group: ['react-icons', 'react-icons/*'],
              message:
                'Librería de iconos externa prohibida — usa el registro propio components/ui/icon.tsx (TD.3).',
            },
            {
              group: ['@heroicons/react', '@heroicons/react/*'],
              message:
                'Librería de iconos externa prohibida — usa el registro propio components/ui/icon.tsx (TD.3).',
            },
            {
              group: ['phosphor-react'],
              message:
                'Librería de iconos externa prohibida — usa el registro propio components/ui/icon.tsx (TD.3).',
            },
            {
              group: ['@phosphor-icons/react', '@phosphor-icons/react/*'],
              message:
                'Librería de iconos externa prohibida — usa el registro propio components/ui/icon.tsx (TD.3).',
            },
            {
              group: ['react-feather'],
              message:
                'Librería de iconos externa prohibida — usa el registro propio components/ui/icon.tsx (TD.3).',
            },
            {
              group: ['@fortawesome/*'],
              message:
                'Librería de iconos externa prohibida — usa el registro propio components/ui/icon.tsx (TD.3).',
            },
          ],
        },
      ],
    },
  },

  // ── 6. Tests: relajar lo unsafe, MANTENER las promesas ────────────────────
  {
    files: ['**/*.test.{ts,tsx}', '**/test/**/*.ts', 'apps/web/e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // NUNCA se relaja: un expect(...) sin await = test en falso verde.
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/test/**/*.test.ts'],
    plugins: { vitest },
    rules: { ...vitest.configs.recommended.rules },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['apps/web/e2e/**/*.spec.ts'],
  },

  // ── 7. JS plano (configs, scripts .mjs): sin type-checking ────────────────
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },

  // ── 8. prettier SIEMPRE al final: apaga toda regla de formato ─────────────
  prettier,
);
